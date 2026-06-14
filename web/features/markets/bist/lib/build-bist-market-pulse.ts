import type { BistMarketPulseResponse } from "@/features/markets/bist/lib/bist-detail-types";
import {
  betaLabel,
  computeBeta,
  computeXu100Correlation,
  defaultXu100Correlation,
  xu100CorrelationLabel,
} from "@/features/markets/bist/lib/bist-correlation-utils";
import {
  benchmarkSymbolFor,
  isBistIndexSymbol,
  normalizeBistSymbol,
  yahooTickerFor,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchYahooChart, type CommodityKline } from "@/features/markets/commodities/lib/commodity-yahoo";

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

function unitFor(symbol: string): string {
  return isBistIndexSymbol(symbol) ? "puan" : "TL";
}

function buildFromKlines(
  symbol: string,
  source: "yahoo" | "computed",
  hourly: CommodityKline[],
  daily: CommodityKline[],
  beta: number,
  benchmarkSymbol: string,
  benchmarkChange30dPct: number,
  xu100Correlation: number,
): BistMarketPulseResponse | null {
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
    xu100Correlation,
    correlationLabel: xu100CorrelationLabel(xu100Correlation),
    levels: { support, resistance, pivot },
  };
}

function buildComputedFallback(symbol: string, changePct: number): BistMarketPulseResponse {
  const sym = normalizeBistSymbol(symbol);
  const base = 100;
  const current = base * (1 + changePct / 100);
  const low = current * 0.985;
  const high = current * 1.015;
  const positionPct = 50 + changePct * 5;
  const isIndex = isBistIndexSymbol(sym);
  const beta = isIndex ? 1.0 : 1.12;
  const corr = defaultXu100Correlation(sym, isIndex);

  return {
    symbol: sym,
    unit: unitFor(sym),
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
    benchmarkSymbol: benchmarkSymbolFor(sym),
    benchmarkChange30dPct: changePct * 2.1,
    xu100Correlation: corr,
    correlationLabel: xu100CorrelationLabel(corr),
    levels: { support: low, resistance: high, pivot: (high + low + current) / 3 },
  };
}

export async function fetchBistMarketPulse(
  symbol: string,
  fallbackChangePct = 0,
): Promise<BistMarketPulseResponse | null> {
  const sym = normalizeBistSymbol(symbol);
  const yahoo = yahooTickerFor(sym);
  const benchSym = benchmarkSymbolFor(sym);
  const benchYahoo = yahooTickerFor(benchSym);
  const isIndex = isBistIndexSymbol(sym);

  if (yahoo) {
    const [hourly, daily, benchDaily] = await Promise.all([
      fetchYahooChart(yahoo, "1h", "5d"),
      fetchYahooChart(yahoo, "1d", "6mo"),
      benchYahoo ? fetchYahooChart(benchYahoo, "1d", "6mo") : Promise.resolve(null),
    ]);

    let beta = isIndex ? 1.0 : 1.08;
    let benchmarkChange30dPct = 0;
    let xu100Correlation = defaultXu100Correlation(sym, isIndex);

    if (daily?.length && benchDaily?.length) {
      const computedBeta = computeBeta(
        daily.slice(-35).map((k) => k.close),
        benchDaily.slice(-35).map((k) => k.close),
      );
      if (computedBeta != null) beta = Number(computedBeta.toFixed(2));

      const corr = computeXu100Correlation(
        daily.slice(-35).map((k) => k.close),
        benchDaily.slice(-35).map((k) => k.close),
      );
      if (corr != null) xu100Correlation = Number(corr.toFixed(2));

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
      xu100Correlation,
    );
    if (built) return built;
  }

  return buildComputedFallback(sym, fallbackChangePct);
}
