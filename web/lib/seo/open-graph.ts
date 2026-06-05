/**
 * Sunucu tarafı metadata / Open Graph — anon Supabase ile güvenli okuma (RLS’e tabi).
 * Tam URL yalnızca https ile başlayan depolama URL’lerinde kullanılır.
 */

export function pickHttpsUrl(u: unknown): string | null {
  if (typeof u !== "string") return null;
  const t = u.trim();
  if (!t.startsWith("https://")) return null;
  return t;
}

export function ogImageFromMediaUrls(media: unknown): string | null {
  if (!media || !Array.isArray(media)) return null;
  for (const item of media) {
    if (!item || typeof item !== "object") continue;
    const rec = item as { url?: unknown; type?: unknown; thumbnail_url?: unknown };
    const typ = typeof rec.type === "string" ? rec.type : "";
    const url = typeof rec.url === "string" ? rec.url : "";
    const thumb = typeof rec.thumbnail_url === "string" ? rec.thumbnail_url : "";
    if (typ === "image" || typ === "gif") {
      const ok = pickHttpsUrl(url);
      if (ok) return ok;
    }
    if (typ === "video" || typ === "short") {
      const ok = pickHttpsUrl(thumb) || pickHttpsUrl(url);
      if (ok) return ok;
    }
  }
  return null;
}

export function ogImageFromPostRow(row: {
  thumbnail_url?: unknown;
  image_url?: unknown;
  media_urls?: unknown;
} | null): string | null {
  if (!row) return null;
  return pickHttpsUrl(row.thumbnail_url) || pickHttpsUrl(row.image_url) || ogImageFromMediaUrls(row.media_urls);
}

export function postTextSnippet(row: { title?: unknown; content?: unknown } | null, maxLen = 58): string {
  const title = typeof row?.title === "string" ? row.title.trim() : "";
  const content = typeof row?.content === "string" ? row.content.trim() : "";
  const raw = (title || content).slice(0, maxLen);
  if (!raw) return "";
  return raw.length >= maxLen ? `${raw.slice(0, maxLen - 1)}…` : raw;
}
