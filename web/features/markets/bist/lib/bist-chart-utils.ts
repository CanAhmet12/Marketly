import type { CommodityKline } from "@/features/markets/commodities/lib/commodity-yahoo";

export { signedPct } from "@/features/markets/bist/lib/bist-sparkline-utils";

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

export function supportResistanceFromCandles(
  candles: readonly CommodityKline[],
  lookback = 14,
): { support: number; resistance: number } | null {
  if (candles.length < 2) return null;
  const recent = candles.slice(-Math.min(lookback, candles.length));
  return {
    support: Math.min(...recent.map((c) => c.low)),
    resistance: Math.max(...recent.map((c) => c.high)),
  };
}
