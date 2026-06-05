import type { RelatedVideo, WatchPostDetail } from "@/features/watch/types";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";

export function tierDotClass(tier: string): string {
  if (tier === "elite") return "bg-[var(--color-tier-elite)]";
  if (tier === "pro") return "bg-[var(--color-tier-pro)]";
  return "bg-[var(--color-tier-free)]";
}

export function resolveVideoUrl(post: WatchPostDetail): string | null {
  const u = post.video_url?.trim();
  if (u) return u;
  const m = post.media_urls as Array<{ type?: string; url?: string }> | null;
  const v = m?.find((x) => x.type === "video" && x.url);
  return v?.url?.trim() ?? null;
}

export function posterUrl(post: WatchPostDetail): string | null {
  if (post.thumbnail_url?.trim()) return post.thumbnail_url;
  if (post.image_url?.trim()) return post.image_url;
  const m = post.media_urls as Array<{ type?: string; thumbnail_url?: string; url?: string }> | null;
  return m?.[0]?.thumbnail_url?.trim() || m?.[0]?.url?.trim() || null;
}

export function isVideoishPost(post: WatchPostDetail): boolean {
  const t = post.type ?? "";
  return t === "video" || t === "short" || t === "live" || Boolean(resolveVideoUrl(post));
}

export function thumbForRelated(r: RelatedVideo): string | null {
  return r.thumbnail_url?.trim() || r.image_url?.trim() || null;
}

export function resolveRelatedVideoUrl(r: RelatedVideo): string | null {
  const u = r.video_url?.trim();
  if (u) return u;
  return null;
}

export function authorAvatarSrc(post: WatchPostDetail): string {
  if (post.author_avatar?.trim()) return post.author_avatar;
  return fallbackAvatar(post.user_id, post.author_name);
}

export async function shareWatchPost(post: WatchPostDetail): Promise<void> {
  const title = post.title?.trim() || post.content?.slice(0, 80) || "Marketly";
  const text = `${post.author_name}: ${title}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "Marketly", text });
      return;
    } catch {
      /* iptal */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* yok */
  }
}
