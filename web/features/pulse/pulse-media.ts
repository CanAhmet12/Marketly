import type { FeedPost } from "@/features/feed/types";

export function resolvePulseVideoUrl(post: FeedPost): string | null {
  const u = post.video_url?.trim();
  if (u) return u;
  const v = post.media_urls?.find((m) => m.type === "video" && m.url?.trim());
  return v?.url?.trim() ?? null;
}

export function pulsePosterUrl(post: FeedPost): string | null {
  if (post.thumbnail_url?.trim()) return post.thumbnail_url;
  if (post.image_url?.trim()) return post.image_url;
  const t = post.media_urls?.find((m) => m.thumbnail_url?.trim());
  return t?.thumbnail_url?.trim() ?? null;
}

export function pulseTitle(post: FeedPost): string {
  const t = post.title?.trim();
  if (t) return t;
  const c = post.content?.trim();
  if (c) return c.length > 120 ? `${c.slice(0, 120)}…` : c;
  return "Pulse";
}
