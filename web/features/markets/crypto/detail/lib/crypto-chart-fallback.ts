import type { CryptoChartCandle } from "@/features/markets/crypto/detail/lib/crypto-chart-types";

function makeRng(seed: number) {
  let s = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** CoinGecko yoksa deterministik mum üret (mobil ile aynı mantık) */
export function generateFallbackCandles(
  price: number,
  changePercent: number,
  count: number,
  seed: number,
): CryptoChartCandle[] {
  const rng = makeRng(seed + count);
  const candles: CryptoChartCandle[] = [];
  const trendBias = changePercent >= 0 ? 0.53 : 0.47;
  const now = Date.now();
  const stepMs = Math.max(60_000, Math.floor((24 * 60 * 60 * 1000) / count));

  let p = price * (1 - (changePercent / 100) * Math.min(1, count / 24));

  for (let i = 0; i < count; i++) {
    const volatility = p * (0.006 + rng() * 0.016);
    const dir = rng() < trendBias ? 1 : -1;
    const change = dir * volatility;
    const open = p;
    const close = Math.max(p * 0.001, p + change);
    const wickExtra = Math.abs(change) * (0.3 + rng() * 0.8);
    const high = Math.max(open, close) + wickExtra;
    const low = Math.max(p * 0.001, Math.min(open, close) - wickExtra);
    const volume = p * (40_000 + rng() * 120_000);

    candles.push({
      timestamp: now - (count - i) * stepMs,
      open,
      high,
      low,
      close,
      volume,
    });
    p = close;
  }

  return candles;
}

export function fallbackCandleCount(days: number): number {
  if (days <= 1) return 48;
  if (days <= 7) return 56;
  if (days <= 30) return 60;
  if (days <= 90) return 72;
  return 96;
}
