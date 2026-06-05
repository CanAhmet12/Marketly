import type { FeedPost } from "@/features/feed/types";
import { liveHrefForPostId } from "@/features/live/live-href";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";

export function isVideoLikePost(p: FeedPost): boolean {
  const t = (p.type ?? "").toLowerCase();
  return t === "video" || t === "short" || t === "live" || Boolean(p.video_url?.trim());
}

export function isShortPost(p: FeedPost): boolean {
  const t = (p.type ?? "").toLowerCase();
  return t === "pulse" || t === "short";
}

/** Mobil DiscoverScreen “Pulse” — `short` veya `pulse` tipi (Pulse ≠ uzun video). */
export function isPulsePost(p: FeedPost): boolean {
  const t = (p.type ?? "").toLowerCase();
  return t === "short" || t === "pulse";
}

export function isLivePost(p: FeedPost): boolean {
  return (p.type ?? "").toLowerCase() === "live";
}

const SIGNAL_TITLE = /^\[sinyal\]/i;

export function isSignalPost(p: FeedPost): boolean {
  const t = (p.type ?? "").toLowerCase();
  if (t === "signal") return true;
  return SIGNAL_TITLE.test(p.title?.trim() ?? "");
}

/** Uzun video: short/live dışı video içerikleri */
export function isLongVideoPost(p: FeedPost): boolean {
  if (!isVideoLikePost(p)) return false;
  return !isShortPost(p) && !isLivePost(p);
}

export function pickGridThumbnail(p: FeedPost): string | null {
  if (p.thumbnail_url?.trim()) return p.thumbnail_url;
  if (p.image_url?.trim()) return p.image_url;
  const v = p.media_urls?.find((m) => m.thumbnail_url?.trim());
  if (v?.thumbnail_url) return v.thumbnail_url;
  const img = p.media_urls?.find((m) => m.type === "image");
  if (img?.url) return img.url;
  if (p.link_preview?.image?.trim()) return p.link_preview.image;
  return null;
}

export function pickDurationSeconds(p: FeedPost): number | null {
  const m = p.media_urls?.find((x) => typeof x.duration === "number" && x.duration > 0);
  return m?.duration ?? null;
}

export function formatDurationBadge(sec: number): string {
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const CRYPTO_KEYS = ["BTC", "ETH", "SOL", "XRP", "DOGE", "CRYPTO", "USDT", "BNB", "ADA", "AVAX"];

const BOURSE_KEYS = ["XU100", "BIST", "TRY", "USDTRY", "EURTRY", "GRAM", "GUMUS", "XU030", "VIOP", "BORS"];

export function matchesCryptoFilter(p: FeedPost): boolean {
  const tag = (p.asset_tag ?? "").toUpperCase();
  if (CRYPTO_KEYS.some((c) => tag === c || tag.includes(c))) return true;
  const hay = `${p.content} ${p.title ?? ""}`.toUpperCase();
  return CRYPTO_KEYS.some((c) => hay.includes(c));
}

export function matchesBourseFilter(p: FeedPost): boolean {
  const tag = (p.asset_tag ?? "").toUpperCase();
  if (BOURSE_KEYS.some((c) => tag === c || tag.includes(c))) return true;
  const hay = `${p.content} ${p.title ?? ""}`.toUpperCase();
  return BOURSE_KEYS.some((c) => hay.includes(c));
}

export function gridCardTitle(p: FeedPost): string {
  const t = p.title?.trim();
  if (t) return t;
  const c = p.content?.trim();
  if (c) return c.length > 100 ? `${c.slice(0, 100)}…` : c;
  return "Gönderi";
}

export function authorAvatarSrc(post: FeedPost): string {
  if (post.author_avatar?.trim()) return post.author_avatar;
  return fallbackAvatar(post.user_id, post.author_name);
}

export function primaryContentHref(post: FeedPost): string {
  if (isPulsePost(post)) return pulseHrefForPostId(post.id);
  if (isLivePost(post)) return liveHrefForPostId(post.id);
  if (isVideoLikePost(post)) return `/watch/${post.id}`;
  return `/post/${post.id}`;
}
