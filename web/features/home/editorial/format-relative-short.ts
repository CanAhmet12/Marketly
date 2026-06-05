/** Kısa göreli zaman (akış meta). */
export function formatRelativeShort(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 45) return "şimdi";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}dk`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h}s`;
  const d = Math.floor(h / 24);
  if (d < 14) return `${d}g`;
  const w = Math.floor(d / 7);
  return `${w}hf`;
}
