/** Hacim etiketini sıralama için sayıya çevir — "$98.4B", "1.2M" vb. */
export function parseVolumeLabel(raw: string): number {
  const cleaned = raw.replace(/,/g, "").trim();
  const n = parseFloat(cleaned.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  const upper = cleaned.toUpperCase();
  if (upper.includes("T")) return n * 1e12;
  if (upper.includes("B")) return n * 1e9;
  if (upper.includes("M")) return n * 1e6;
  if (upper.includes("K")) return n * 1e3;
  return n;
}
