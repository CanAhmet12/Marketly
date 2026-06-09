/* eslint-disable @next/next/no-img-element -- storage URL */

import Link from "next/link";
import Image from "next/image";

import type { ChannelPost } from "@/features/channel/types";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

import { thumbForPost } from "./channel-display-helpers";

export function ChannelSkeleton() {
  return (
    <div className="ch-canvas ch-skeleton" data-channel-zone="profile" aria-hidden="true">
      <div className="ch-skeleton-cover" />
      <div className="ch-skeleton-hero">
        <div className="ch-skeleton-avatar" />
        <div className="ch-skeleton-identity">
          <div className="ch-skeleton-line ch-skeleton-line--name" />
          <div className="ch-skeleton-line ch-skeleton-line--handle" />
          <div className="ch-skeleton-line ch-skeleton-line--btn" />
        </div>
      </div>
    </div>
  );
}

type PostListCardProps = {
  post: ChannelPost;
  feedPost?: FeedPost;
  engagement?: HomeEngagementHandlers;
};

export function PostListCard({ post, feedPost, engagement }: PostListCardProps) {
  const thumb = thumbForPost(post);
  const snippet = post.content?.trim() || post.title || "Gönderi";
  const canEngage = Boolean(feedPost && engagement);
  const likes = feedPost?.likes ?? post.likes;

  return (
    <div className="ch-post-card-wrap">
      <Link href={`/post/${post.id}`} className="ch-post-card">
        {thumb ? (
          <div className="ch-post-card-thumb">
            {thumb.startsWith("http") ? (
              <Image src={thumb} alt="" width={64} height={64} className="ch-post-card-img" sizes="64px" />
            ) : (
              <img src={thumb} alt="" className="ch-post-card-img" />
            )}
          </div>
        ) : (
          <div className="ch-post-card-thumb ch-post-card-thumb--empty">M</div>
        )}
        <div className="ch-post-card-body">
          <p className="ch-post-card-snippet">{snippet}</p>
          <div className="ch-post-card-meta">
            <span>{formatTimeAgo(post.created_at)}</span>
            {post.asset_tag ? <span className="ch-post-card-tag">{post.asset_tag}</span> : null}
            {canEngage ? <span className="ch-post-card-sep">·</span> : null}
            {canEngage ? <span>{likes} beğeni</span> : null}
            <span className="ch-post-card-sep">·</span>
            <span className="ch-post-card-cta">Gönderiyi aç</span>
          </div>
        </div>
      </Link>
      {canEngage && feedPost && engagement ? (
        <div className="ch-post-card-actions">
          <button
            type="button"
            className={cn("ch-post-card-action", feedPost.is_liked && "ch-post-card-action--active")}
            aria-label={feedPost.is_liked ? "Beğeniyi kaldır" : "Beğen"}
            aria-pressed={feedPost.is_liked}
            disabled={engagement.likePendingPostId === feedPost.id}
            onClick={() => engagement.onToggleLike(feedPost)}
          >
            ♥
          </button>
          <button
            type="button"
            className={cn("ch-post-card-action", feedPost.is_saved && "ch-post-card-action--active")}
            aria-label={feedPost.is_saved ? "Kaydı kaldır" : "Kaydet"}
            aria-pressed={feedPost.is_saved}
            disabled={engagement.savePendingPostId === feedPost.id}
            onClick={() => engagement.onToggleSave(feedPost)}
          >
            ⌁
          </button>
        </div>
      ) : null}
    </div>
  );
}
