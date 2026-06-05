/** Adapter: ChannelPost → FeedPost (Discover canonical cards için) */

import type { ChannelPost, ChannelSignal } from "@/features/channel/types";
import type { FeedPost } from "@/features/feed/types";

export function channelPostToFeedPost(channelPost: ChannelPost, authorName: string, authorHandle: string, avatarUrl: string | null): FeedPost {
  return {
    id: channelPost.id,
    user_id: channelPost.user_id,
    content: channelPost.content || "",
    type: channelPost.type || "post",
    video_url: channelPost.video_url,
    thumbnail_url: channelPost.thumbnail_url,
    image_url: channelPost.image_url,
    title: channelPost.title,
    likes: channelPost.likes,
    comments: channelPost.comments,
    views_count: null,
    asset_tag: channelPost.asset_tag,
    media_urls: null,
    created_at: channelPost.created_at,
    author_name: authorName,
    author_handle: authorHandle,
    author_avatar: avatarUrl,
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

export function channelSignalToFeedPost(signal: ChannelSignal, authorName: string, authorHandle: string, avatarUrl: string | null): FeedPost {
  return {
    id: signal.id,
    user_id: signal.creator_id,
    content: signal.rationale || "",
    type: "signal",
    video_url: null,
    thumbnail_url: null,
    image_url: null,
    title: `${signal.symbol} - ${signal.direction}`,
    likes: signal.likes_count,
    comments: 0,
    views_count: null,
    asset_tag: signal.symbol,
    media_urls: null,
    created_at: signal.created_at,
    author_name: authorName,
    author_handle: authorHandle,
    author_avatar: avatarUrl,
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
