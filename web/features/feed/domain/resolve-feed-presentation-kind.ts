import type { FeedPost } from "@/features/feed/types";
import { isLivePost, isShortPost, isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";

/**
 * Ürün sunumu için içerik sınıfı — tek grid kartından çıkışın domain kaynağı.
 * Backend ileride explicit `content_kind` gönderene kadar türetilir.
 */
export type FeedPresentationKind =
  | "video_long"
  | "short"
  | "live"
  | "signal"
  | "text_post"
  | "market_post"
  | "unknown";

/** Metin ağırlıklı: video kısa/canlı/sinyal değil ve görsel baskın değil */
function isTextFirstPost(p: FeedPost): boolean {
  if (isVideoLikePost(p) || isSignalPost(p)) return false;
  const hasStrongVisual = Boolean(
    p.thumbnail_url?.trim() ||
      p.image_url?.trim() ||
      p.media_urls?.some((m) => m.type === "image" || m.type === "gif"),
  );
  if (hasStrongVisual) return false;
  const text = `${p.title ?? ""} ${p.content}`.trim();
  return text.length > 0;
}

function isMarketHeavyPost(p: FeedPost): boolean {
  const hay = `${p.title ?? ""} ${p.content} ${p.asset_tag ?? ""}`.toUpperCase();
  const keys = ["FED", "FAİZ", "ENFLASYON", "TÜFE", "ÜFE", "TCMB", "HİSSE", "BİLANÇO", "TEMETTÜ", "AÇIKLAMA"];
  return keys.some((k) => hay.includes(k));
}

export function resolveFeedPresentationKind(post: FeedPost): FeedPresentationKind {
  if (isSignalPost(post)) return "signal";
  if (isLivePost(post)) return "live";
  if (isShortPost(post)) return "short";
  if (isVideoLikePost(post)) return "video_long";
  if (isTextFirstPost(post)) return "text_post";
  if (isMarketHeavyPost(post)) return "market_post";
  return "unknown";
}
