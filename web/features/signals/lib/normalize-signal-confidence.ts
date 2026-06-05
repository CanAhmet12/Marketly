/** DB 1–5 skalasını UI yüzdesine çevirir; zaten 0–100 ise dokunmaz. */
export function normalizeSignalConfidence(raw: number): number {
  if (!Number.isFinite(raw)) return 50;
  if (raw <= 5) return Math.min(100, Math.max(0, Math.round(raw * 20)));
  return Math.min(100, Math.max(0, Math.round(raw)));
}
