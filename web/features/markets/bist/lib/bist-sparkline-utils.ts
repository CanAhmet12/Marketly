/** BIST sparkline — amplified görünüm */

export function sparkFromChange(changePct: number, points = 8): number[] {
  const base = 100;
  const step = changePct / (points - 1);
  return Array.from({ length: points }, (_, i) => base + step * i);
}

export function exaggerateSpark(series: readonly number[]): number[] {
  if (series.length < 2) return [...series];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const mid = (min + max) / 2;
  const span = max - min || 1;
  const boost = Math.min(2.4, 1 + span / Math.max(Math.abs(mid), 1) * 0.35);
  return series.map((v) => mid + (v - mid) * boost);
}

export function resolveBistSparkline(changePct: number, series: readonly number[]): number[] {
  const base = series.length >= 2 ? [...series] : sparkFromChange(changePct);
  return exaggerateSpark(base);
}

export function trendFromSeries(series: readonly number[]): "up" | "down" | "flat" {
  if (series.length < 2) return "flat";
  const first = series[0]!;
  const last = series[series.length - 1]!;
  const delta = ((last - first) / (Math.abs(first) || 1)) * 100;
  if (delta > 0.05) return "up";
  if (delta < -0.05) return "down";
  return "flat";
}

export function signedPct(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}
