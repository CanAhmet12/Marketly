"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import {
  authorAvatarSrc,
  formatDurationBadge,
  gridCardTitle,
  pickDurationSeconds,
  pickGridThumbnail,
} from "@/features/feed/feed-display";
import { searchPostToFeedPost } from "@/features/search/adapters/search-post-to-feed-post";
import type { SearchPostHit } from "@/features/search/types";
import { homeHrefForFeedPost } from "@/features/home/routing";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

export type SearchContentHitVariant = "video" | "pulse" | "live" | "post";

type Props = {
  post: SearchPostHit;
  variant: SearchContentHitVariant;
};

export function SearchContentHit({ post, variant }: Props) {
  const feedPost = searchPostToFeedPost(post);
  const href = homeHrefForFeedPost(feedPost);
  const title = gridCardTitle(feedPost);
  const thumb = pickGridThumbnail(feedPost);
  const duration = pickDurationSeconds(feedPost);
  const durationBadge = duration ? formatDurationBadge(duration) : null;
  const [imgFailed, setImgFailed] = useState(false);

  if (variant === "post") {
    const preview = post.content.trim().slice(0, 160) || title;
    return (
      <Link href={href} className="srch-hit srch-hit--post">
        <SafeAvatar src={authorAvatarSrc(feedPost)} alt="" size={36} className="srch-hit__avatar" />
        <div className="srch-hit__post-copy">
          <div className="srch-hit__post-head">
            <span className="srch-hit__author">{post.author_name}</span>
            <span className="srch-hit__meta-inline">{formatTimeAgo(post.created_at)}</span>
          </div>
          <p className="srch-hit__post-title">{title}</p>
          <p className="srch-hit__post-preview">{preview}</p>
          <p className="srch-hit__meta">
            {formatCompactCount(post.likes)} beğeni · {formatCompactCount(post.comments)} yorum
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "srch-hit srch-hit--media",
        variant === "pulse" && "srch-hit--media-pulse",
        variant === "live" && "srch-hit--media-live",
      )}
    >
      <div className="srch-hit__thumb">
        {thumb && !imgFailed ? (
          <img src={thumb} alt="" loading="lazy" onError={() => setImgFailed(true)} />
        ) : (
          <div className="srch-hit__thumb-fallback" />
        )}
        {variant === "live" ? <span className="srch-hit__live-badge">CANLI</span> : null}
        {variant === "pulse" ? <span className="srch-hit__pulse-badge">PULSE</span> : null}
        {durationBadge ? <span className="srch-hit__duration">{durationBadge}</span> : null}
      </div>
      <div className="srch-hit__media-copy">
        <p className="srch-hit__media-title">{title}</p>
        <p className="srch-hit__meta">
          {post.author_name} · {formatCompactCount(post.views_count || 0)} görüntülenme
        </p>
      </div>
    </Link>
  );
}
