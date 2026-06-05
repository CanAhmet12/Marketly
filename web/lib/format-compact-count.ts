/** Tabular-friendly compact counts for grid / rail metadata (tr-TR). */
export function formatCompactCount(n: number): string {
  const v = Math.max(0, Math.floor(n));
  if (v >= 1_000_000) {
    const x = v / 1_000_000;
    const s = x >= 10 ? x.toFixed(0) : x.toFixed(1).replace(/\.0$/, "");
    return `${s}\u00a0Mn`;
  }
  if (v >= 10_000) {
    const x = v / 1000;
    const s = x >= 100 ? x.toFixed(0) : x.toFixed(1).replace(/\.0$/, "");
    return `${s}\u00a0B`;
  }
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}\u00a0B`;
  }
  return v.toLocaleString("tr-TR");
}
