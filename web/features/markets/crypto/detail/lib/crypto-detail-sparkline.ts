/** Detay hero sparkline — düz serileri okunur hale getirir (pulse bar ile aynı mantık) */

export function exaggerateSparkForDisplay(series: number[], change24h: number): number[] {
  if (series.length >= 2) {
    const min = Math.min(...series);
    const max = Math.max(...series);
    const mid = (min + max) / 2;
    const span = max - min;
    const targetSpan = Math.max(span, Math.abs(mid) * 0.06, Math.abs(change24h) * 0.15, 0.4);
    if (span >= targetSpan * 0.85) return series;
    const scale = targetSpan / (span || 1);
    return series.map((v) => mid + (v - mid) * scale);
  }

  if (series.length === 1) return [series[0]!, series[0]!];

  const end = 100 + change24h;
  return [100, end];
}
