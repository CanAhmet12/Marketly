/** Forex canvas — sparkline yardımcıları (kripto utils ile uyumlu) */

import {
  sparkFromChange,
  trendFromSeries,
} from "@/features/markets/crypto/lib/crypto-sparkline-utils";

export { sparkFromChange, trendFromSeries };

/** Düz sparkline'ları pulse bar'da okunur hale getir */
export function exaggerateSpark(series: number[]): number[] {
  if (series.length < 2) return series;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const mid = (min + max) / 2;
  const span = max - min;
  const targetSpan = Math.max(span, Math.abs(mid) * 0.06, 0.4);
  if (span >= targetSpan * 0.85) return series;
  const scale = targetSpan / (span || 1);
  return series.map((v) => mid + (v - mid) * scale);
}

export function resolvePairSparkline(changePct: number, sparkline?: number[]): number[] {
  if (sparkline && sparkline.length > 1) return sparkline;
  return sparkFromChange(changePct);
}
