import type { CryptoChartCandle, CryptoChartRangeStats } from "@/features/markets/crypto/detail/lib/crypto-chart-types";

export function computeRangeStats(candles: readonly CryptoChartCandle[]): CryptoChartRangeStats | null {
  if (!candles.length) return null;
  const high = Math.max(...candles.map((c) => c.high));
  const low = Math.min(...candles.map((c) => c.low));
  const first = candles[0]!.close;
  const last = candles[candles.length - 1]!.close;
  const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
  const volumeSum = candles.reduce((s, c) => s + c.volume, 0);

  return {
    high,
    low,
    changePct,
    volumeLabel: formatCompactUsd(volumeSum),
  };
}

export function formatCompactUsd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatChartPrice(n: number): string {
  if (n >= 10_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 100) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}

export function formatChartTime(ts: number, days: number): string {
  const d = new Date(ts);
  if (days <= 1) {
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  if (days <= 7) {
    return d.toLocaleString("tr-TR", { weekday: "short", hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

/** Karşılaştırma overlay — ilk kapanışa göre % performans */
export function normalizeCloses(candles: readonly CryptoChartCandle[]): number[] {
  if (!candles.length) return [];
  const base = candles[0]!.close || 1;
  return candles.map((c) => ((c.close - base) / base) * 100);
}

export function resampleNormalizedSeries(primary: readonly CryptoChartCandle[], compare: readonly CryptoChartCandle[]): number[] {
  if (!primary.length || !compare.length) return [];
  const base = compare[0]!.close || 1;
  const len = primary.length;
  return primary.map((_, i) => {
    const idx = Math.min(compare.length - 1, Math.round((i / Math.max(1, len - 1)) * (compare.length - 1)));
    const close = compare[idx]!.close;
    return ((close - base) / base) * 100;
  });
}

export const CRYPTO_COMPARE_CANDIDATES = ["BTC", "ETH", "SOL", "BNB"] as const;
