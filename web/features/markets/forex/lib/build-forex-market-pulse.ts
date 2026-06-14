import type { ForexMarketPulseResponse } from "@/features/markets/forex/lib/forex-detail-types";
import {
  computeDxyCorrelation,
  defaultDxySensitivity,
  dxySensitivityLabel,
} from "@/features/markets/forex/lib/forex-correlation-utils";
import { pipsBetween } from "@/features/markets/forex/lib/forex-pip-utils";
import {
  forexPairLabel,
  normalizeForexSymbol,
  yahooTickerFor,
} from "@/features/markets/forex/lib/forex-symbol-meta";
import { fetchYahooChart, type CommodityKline } from "@/features/markets/commodities/lib/commodity-yahoo";

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

function buildFromKlines(
  symbol: string,
  source: "yahoo" | "computed",
  hourly: CommodityKline[],
  daily: CommodityKline[],
  dxySensitivity: number,
  benchmarkChange30dPct: number,
): ForexMarketPulseResponse | null {
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
  const pipRange24h = pipsBetween(high24, low24, symbol);

  const recentDaily = d.slice(-14);
  const support = Math.min(...recentDaily.map((c) => c.low));
  const resistance = Math.max(...recentDaily.map((c) => c.high));
  const pivot = (high24 + low24 + current) / 3;

  return {
    symbol,
    pair: forexPairLabel(symbol),
    unit: "kur",
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
    pipRange24h,
    beta: dxySensitivity,
    betaLabel: dxySensitivityLabel(dxySensitivity),
    benchmarkSymbol: "DXY",
    benchmarkChange30dPct,
    levels: { support, resistance, pivot },
  };
}

function buildComputedFallback(symbol: string, changePct: number): ForexMarketPulseResponse {
  const current = 1 * (1 + changePct / 100);
  const low = current * 0.9985;
  const high = current * 1.0015;
  const sensitivity = defaultDxySensitivity(symbol);

  return {
    symbol,
    pair: forexPairLabel(symbol),
    unit: "kur",
    source: "computed",
    updatedAt: Date.now(),
    currentPrice: current,
    returns: [
      { key: "1h", label: "1s", changePct: changePct * 0.12 },
      { key: "24h", label: "24s", changePct: changePct },
      { key: "7d", label: "7g", changePct: changePct * 1.2 },
      { key: "30d", label: "30g", changePct: changePct * 2.5 },
      { key: "90d", label: "90g", changePct: changePct * 4 },
    ],
    range24h: { high, low, positionPct: 50 },
    volatility24hPct: Math.abs(changePct) * 0.6 + 0.2,
    pipRange24h: pipsBetween(high, low, symbol),
    beta: sensitivity,
    betaLabel: dxySensitivityLabel(sensitivity),
    benchmarkSymbol: "DXY",
    benchmarkChange30dPct: changePct * 1.8,
    levels: { support: low, resistance: high, pivot: (high + low + current) / 3 },
  };
}

export async function fetchForexMarketPulse(
  symbol: string,
  fallbackChangePct = 0,
): Promise<ForexMarketPulseResponse | null> {
  const sym = normalizeForexSymbol(symbol);
  const yahoo = yahooTickerFor(sym);

  if (yahoo) {
    const [hourly, daily, dxyDaily] = await Promise.all([
      fetchYahooChart(yahoo, "1h", "5d"),
      fetchYahooChart(yahoo, "1d", "6mo"),
      fetchYahooChart("DX-Y.NYB", "1d", "6mo"),
    ]);

    let dxySensitivity = defaultDxySensitivity(sym);
    let benchmarkChange30dPct = 0;

    if (sym !== "DXY") {
      dxySensitivity = await computeDxyCorrelation(sym, 60);
    }

    if (dxyDaily && dxyDaily.length >= 31) {
      const cur = dxyDaily[dxyDaily.length - 1]!.close;
      const prev = dxyDaily[dxyDaily.length - 31]!.close;
      benchmarkChange30dPct = pctChange(cur, prev);
    }

    const built = buildFromKlines(
      sym,
      "yahoo",
      hourly ?? [],
      daily ?? [],
      dxySensitivity,
      benchmarkChange30dPct,
    );
    if (built) return built;
  }

  return buildComputedFallback(sym, fallbackChangePct);
}
