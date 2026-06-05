/** Mobil `EnhancedPostCard` timeAgo ile uyumlu */
export function formatTimeAgo(isoStr: string): string {
  if (!isoStr) return "";
  const ts = new Date(isoStr).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Date.now() - ts;
  if (diff < 0) return "az önce";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}g`;
  if (d < 30) return `${Math.floor(d / 7)}hf`;
  return `${Math.floor(d / 30)}ay`;
}
