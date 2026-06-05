/** Thumbnail türü — grid / watch yedekleri için etiketleme */

export type ThumbnailContentKind = "video" | "short" | "live" | "post" | "signal";

export function resolveThumbnailKind(
  type: string | null | undefined,
  videoish: boolean,
  isLive: boolean,
  isShort: boolean,
): ThumbnailContentKind {
  if (isLive) return "live";
  if (isShort) return "short";
  const t = (type ?? "").toLowerCase();
  if (t === "signal") return "signal";
  if (videoish) return "video";
  return "post";
}
