/** Kısa gösterim — beğeni / yorum sayıları (Türkçe gruplama). */
export function formatCompactCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return String(Math.round(n));
  if (n < 1_000_000) {
    const v = n / 1000;
    const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(1).replace(".0", "");
    return `${s.replace(".", ",")}b`;
  }
  const v = n / 1_000_000;
  const s = v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(".0", "");
  return `${s.replace(".", ",")}m`;
}
