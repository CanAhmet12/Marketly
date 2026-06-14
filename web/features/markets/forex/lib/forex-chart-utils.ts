import type { CommodityKline } from "@/features/markets/commodities/lib/commodity-yahoo";
import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import { formatPipCount, pipsBetween } from "@/features/markets/forex/lib/forex-pip-utils";

export function signedPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function periodChangeFromCandles(
  candles: readonly CommodityKline[],
  lookback: number,
): number | null {
  if (candles.length < 2) return null;
  const last = candles[candles.length - 1]!.close;
  const idx = Math.max(0, candles.length - 1 - lookback);
  const prev = candles[idx]?.close ?? candles[0]!.open;
  if (prev <= 0) return null;
  return pctChange(last, prev);
}

export function dayHighLowFromCandles(
  candles: readonly CommodityKline[],
  lookback = 24,
): { high: number; low: number } | null {
  if (candles.length < 2) return null;
  const recent = candles.slice(-Math.min(lookback, candles.length));
  return {
    high: Math.max(...recent.map((c) => c.high)),
    low: Math.min(...recent.map((c) => c.low)),
  };
}

export function formatDayStats(
  candles: readonly CommodityKline[],
  symbol: string,
  lookback = 24,
): { dayHigh: string; dayLow: string; pipRange: string } | null {
  const hl = dayHighLowFromCandles(candles, lookback);
  if (!hl) return null;

  return {
    dayHigh: formatForexTickerPrice(hl.high, symbol),
    dayLow: formatForexTickerPrice(hl.low, symbol),
    pipRange: formatPipCount(pipsBetween(hl.high, hl.low, symbol)),
  };
}
