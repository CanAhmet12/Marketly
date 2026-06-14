import type { NasdaqMarketPulseResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";
import {
  betaLabel,
  computeBeta,
} from "@/features/markets/nasdaq/lib/nasdaq-correlation-utils";
import {
  benchmarkSymbolFor,
  isNasdaqIndexSymbol,
  yahooTickerFor,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { fetchYahooChart, type CommodityKline } from "@/features/markets/commodities/lib/commodity-yahoo";

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

function unitFor(symbol: string): string {
  return isNasdaqIndexSymbol(symbol) ? "puan" : "USD";
}

function buildFromKlines(
  symbol: string,
  source: "yahoo" | "computed",
  hourly: CommodityKline[],
  daily: CommodityKline[],
  beta: number,
  benchmarkSymbol: string,
  benchmarkChange30dPct: number,
): NasdaqMarketPulseResponse | null {
  if (hourly.length < 2 && daily.length < 2) return null;

  const h = hourly.length > 0 ? hourly : daily;
  const d = daily.length > 0 ? daily : hourly;
  const current = h[h.length - 1]!.close;
  if (!Number.isFinite(current) || current <= 0) return null;

  const h1 = h.length >= 2 ? pctChange(current, h[h.length - 2]!.close) : 0;
  const h24 =
    h.length >= 25
      ? pctChange(current, h[h.length - 25]!.close)
      : h.length >= 2
        ? pctChange(current, h[0]!.open)
        : 0;

  const d7 = d.length >= 8 ? pctChange(current, d[d.length - 8]!.close) : 0;
  const d30 = d.length >= 31 ? pctChange(current, d[d.length - 31]!.close) : 0;
  const d90 = d.length >= 91 ? pctChange(current, d[d.length - 91]!.close) : pctChange(current, d[0]!.close);

  const recentHourly = h.slice(-24);
  const rangeSource = recentHourly.length >= 2 ? recentHourly : h;
  const high24 = Math.max(...rangeSource.map((c) => c.high));
  const low24 = Math.min(...rangeSource.map((c) => c.low));
  const mid24 = (high24 + low24) / 2;
  const positionPct =
    high24 > low24 ? Math.min(100, Math.max(0, ((current - low24) / (high24 - low24)) * 100)) : 50;
  const volatility24hPct = mid24 > 0 ? ((high24 - low24) / mid24) * 100 : 0;

  const recentDaily = d.slice(-14);
  const support = Math.min(...recentDaily.map((c) => c.low));
  const resistance = Math.max(...recentDaily.map((c) => c.high));
  const pivot = (high24 + low24 + current) / 3;

  return {
    symbol,
    unit: unitFor(symbol),
    source,
    updatedAt: Date.now(),
    currentPrice: current,
    returns: [
      { key: "1h", label: "1s", changePct: h1 },
      { key: "24h", label: "24s", changePct: h24 },
      { key: "7d", label: "7g", changePct: d7 },
      { key: "30d", label: "30g", changePct: d30 },
      { key: "90d", label: "90g", changePct: d90 },
    ],
    range24h: { high: high24, low: low24, positionPct },
    volatility24hPct,
    beta,
    betaLabel: betaLabel(beta),
    benchmarkSymbol,
    benchmarkChange30dPct,
    levels: { support, resistance, pivot },
  };
}

function buildComputedFallback(symbol: string, changePct: number): NasdaqMarketPulseResponse {
  const base = 100;
  const current = base * (1 + changePct / 100);
  const low = current * 0.985;
  const high = current * 1.015;
  const positionPct = 50 + changePct * 5;
  const beta = isNasdaqIndexSymbol(symbol) ? 1.05 : 1.2;

  return {
    symbol,
    unit: unitFor(symbol),
    source: "computed",
    updatedAt: Date.now(),
    currentPrice: current,
    returns: [
      { key: "1h", label: "1s", changePct: changePct * 0.12 },
      { key: "24h", label: "24s", changePct: changePct },
      { key: "7d", label: "7g", changePct: changePct * 1.4 },
      { key: "30d", label: "30g", changePct: changePct * 3.2 },
      { key: "90d", label: "90g", changePct: changePct * 5.5 },
    ],
    range24h: { high, low, positionPct: Math.min(100, Math.max(0, positionPct)) },
    volatility24hPct: Math.abs(changePct) * 0.8 + 0.6,
    beta,
    betaLabel: betaLabel(beta),
    benchmarkSymbol: benchmarkSymbolFor(symbol),
    benchmarkChange30dPct: changePct * 2.1,
    levels: { support: low, resistance: high, pivot: (high + low + current) / 3 },
  };
}

export async function fetchNasdaqMarketPulse(
  symbol: string,
  fallbackChangePct = 0,
): Promise<NasdaqMarketPulseResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const yahoo = yahooTickerFor(sym);
  const benchSym = benchmarkSymbolFor(sym);
  const benchYahoo = yahooTickerFor(benchSym);

  if (yahoo) {
    const [hourly, daily, benchDaily] = await Promise.all([
      fetchYahooChart(yahoo, "1h", "5d"),
      fetchYahooChart(yahoo, "1d", "6mo"),
      benchYahoo ? fetchYahooChart(benchYahoo, "1d", "6mo") : Promise.resolve(null),
    ]);

    let beta = isNasdaqIndexSymbol(sym) ? 1.0 : 1.15;
    let benchmarkChange30dPct = 0;

    if (daily?.length && benchDaily?.length) {
      const computed = computeBeta(
        daily.slice(-35).map((k) => k.close),
        benchDaily.slice(-35).map((k) => k.close),
      );
      if (computed != null) beta = Number(computed.toFixed(2));

      if (benchDaily.length >= 31) {
        const bCur = benchDaily[benchDaily.length - 1]!.close;
        const bPrev = benchDaily[benchDaily.length - 31]!.close;
        benchmarkChange30dPct = pctChange(bCur, bPrev);
      } else if (benchDaily.length >= 2) {
        benchmarkChange30dPct = pctChange(
          benchDaily[benchDaily.length - 1]!.close,
          benchDaily[0]!.open,
        );
      }
    }

    const built = buildFromKlines(
      sym,
      "yahoo",
      hourly ?? [],
      daily ?? [],
      beta,
      benchSym,
      benchmarkChange30dPct,
    );
    if (built) return built;
  }

  return buildComputedFallback(sym, fallbackChangePct);
}
