import type { ChannelPost } from "@/features/channel/types";

export function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function tierChip(tier: string): { label: string; className: string } {
  if (tier === "elite") return { label: "ELITE", className: "border-[var(--color-tier-elite)] text-[#8a7200] bg-[#fff9e6]" };
  if (tier === "pro") return { label: "PRO", className: "border-[var(--color-tier-pro)] text-[var(--color-tier-pro)] bg-[#e8f4ff]" };
  return { label: "", className: "" };
}

export function resolveVideoUrl(post: ChannelPost): string | null {
  const u = post.video_url?.trim();
  if (u) return u;
  const m = post.media_urls as Array<{ type?: string; url?: string }> | null;
  const v = m?.find((x) => x.type === "video" && x.url);
  return v?.url?.trim() ?? null;
}

export function thumbForPost(post: ChannelPost): string | null {
  if (post.thumbnail_url?.trim()) return post.thumbnail_url;
  if (post.image_url?.trim()) return post.image_url;
  const m = post.media_urls as Array<{ type?: string; thumbnail_url?: string; url?: string }> | null;
  return m?.[0]?.thumbnail_url?.trim() || m?.[0]?.url?.trim() || null;
}

export function isVideoTabType(t: string | null): boolean {
  return t === "video";
}

export function isShortType(t: string | null): boolean {
  return t === "short" || t === "pulse";
}

export function isLiveType(t: string | null): boolean {
  return t === "live";
}

export function isFeedPostType(t: string | null): boolean {
  return !isVideoTabType(t) && !isShortType(t) && !isLiveType(t);
}
