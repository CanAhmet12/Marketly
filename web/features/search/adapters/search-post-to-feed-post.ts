import type { FeedPost } from "@/features/feed/types";
import type { SearchPostHit } from "@/features/search/types";

/** SearchPostHit → FeedPost (VideoCard / PulseCard / LiveCard / FeedPostCard) */
export function searchPostToFeedPost(hit: SearchPostHit): FeedPost {
  const duration = hit.duration;
  return {
    id: hit.id,
    user_id: hit.user_id,
    content: hit.content ?? "",
    type: hit.type,
    video_url: null,
    thumbnail_url: hit.thumbnail_url,
    image_url: hit.image_url,
    title: hit.title,
    likes: hit.likes,
    comments: hit.comments,
    views_count: hit.views_count ?? null,
    created_at: hit.created_at,
    asset_tag: hit.asset_tag,
    media_urls:
      duration && duration > 0
        ? [{ url: hit.thumbnail_url ?? "", type: "video" as const, duration }]
        : null,
    author_name: hit.author_name,
    author_handle: hit.author_handle,
    author_avatar: hit.author_avatar,
    author_tier: "free",
    is_liked: false,
    is_saved: false,
    mentioned_users: null,
    link_preview: null,
    quoted_post_id: null,
    quoted_post: null,
    social_repost: null,
  };
}
