import { isLivePost, isLongVideoPost, isPulsePost, isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { liveHrefForPostId } from "@/features/live/live-href";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";

/**
 * Ana sayfa bölüm öğeleri için kanonik route.
 */
export function homeHrefForFeedPost(post: FeedPost): string {
  if (isPulsePost(post)) return pulseHrefForPostId(post.id);
  if (isLivePost(post)) return liveHrefForPostId(post.id);
  if (isLongVideoPost(post) || isVideoLikePost(post)) return `/watch/${post.id}`;
  return `/post/${post.id}`;
}

/** Sinyal satırı — `/signals/[id]` yoksa gönderi detayı */
export function homeHrefForSignalPost(postId: string): string {
  return `/post/${postId}`;
}
