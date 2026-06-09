import { isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { SavedSectionId } from "@/features/saved/saved-section-params";

const WEEK_MS = 7 * 86_400_000;

export function filterSavedPosts(posts: readonly FeedPost[], section: SavedSectionId): FeedPost[] {
  if (section === "all") return [...posts];
  if (section === "recent") {
    const cutoff = Date.now() - WEEK_MS;
    return posts.filter((p) => new Date(p.created_at).getTime() >= cutoff);
  }
  if (section === "video") {
    return posts.filter((p) => isVideoLikePost(p));
  }
  if (section === "markets") {
    return posts.filter((p) => Boolean(p.asset_tag?.trim()));
  }
  return [...posts];
}

export function buildSavedSectionCounts(posts: readonly FeedPost[]): Record<SavedSectionId, number> {
  const weekAgo = Date.now() - WEEK_MS;
  return {
    all: posts.length,
    recent: posts.filter((p) => new Date(p.created_at).getTime() >= weekAgo).length,
    video: posts.filter((p) => isVideoLikePost(p)).length,
    markets: posts.filter((p) => Boolean(p.asset_tag?.trim())).length,
  };
}
