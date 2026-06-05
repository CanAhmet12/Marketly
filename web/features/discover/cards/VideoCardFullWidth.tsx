"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc, formatDurationBadge, gridCardTitle, pickDurationSeconds, pickGridThumbnail } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { HomeCinematicPostShell } from "@/features/home/presentation/home-post-layout";
import { homeHrefForFeedPost } from "@/features/home/routing";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

type Props = {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
  index?: number;
  /** Keşfet uzun video — daha geniş sahne, pulse’dan tamamen ayrı editoryal his */
  discoverCinematic?: boolean;
};

export function VideoCardFullWidth({ post, engagement, index = 0, discoverCinematic = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumb = pickGridThumbnail(post);
  const title = gridCardTitle(post);
  const href = homeHrefForFeedPost(post);
  const duration = pickDurationSeconds(post);
  const durationBadge = duration ? formatDurationBadge(duration) : null;

  const thumbInner = (
    <>
      <Link href={href} className="absolute inset-0 z-0" aria-label={title}>
        {thumb && !imgFailed ? (
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] text-[14px] font-semibold text-white">
            Video
          </div>
        )}
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.45] transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-xl sm:h-16 sm:w-16">
          <svg width="18" height="22" viewBox="0 0 16 18" fill="none" className="ml-0.5" aria-hidden>
            <path d="M1 1.5L15 9L1 16.5V1.5Z" fill="currentColor" className="text-[var(--color-primary)]" />
          </svg>
        </div>
      </div>
      {durationBadge ? (
        <span className="absolute bottom-2 right-2 z-[1] rounded-md bg-black/78 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
          {durationBadge}
        </span>
      ) : null}
      {post.views_count && post.views_count > 0 ? (
        <span className="absolute bottom-2 left-2 z-[1] flex items-center gap-0.5 rounded-md bg-black/78 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {formatCompactCount(post.views_count)}
        </span>
      ) : null}
    </>
  );

  return (
    <HomeCinematicPostShell
      className={cn(
        "discover-video-full-card group motion-entrance transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_4%,var(--color-bg-subtle))]",
        discoverCinematic && "discover-video-editorial",
      )}
      style={motionEntranceDelay(index)}
      stage={
        <div
          className={cn(
            "relative w-full max-w-full bg-[var(--color-thumb-bg)]",
            discoverCinematic
              ? "aspect-video min-h-[11.5rem] sm:min-h-[14rem] lg:min-h-[min(18rem,32vw)]"
              : "aspect-[2/1] min-h-[12rem] sm:aspect-[2.2/1] sm:min-h-[14rem]",
            "transition-[box-shadow] duration-200 ease-out group-hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]",
            discoverCinematic &&
              "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--hv-teal)_10%,transparent)] group-hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--hv-teal)_22%,transparent)]",
          )}
        >
          {thumbInner}
        </div>
      }
      below={
        <>
          <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
            <Link href={`/channel/${post.user_id}`} tabIndex={-1} className="shrink-0">
              <SafeAvatar src={authorAvatarSrc(post)} alt="" size={40} className="h-10 w-10 rounded-full ring-1 ring-[color:var(--color-ring-subtle)]" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link href={`/channel/${post.user_id}`} className={cn("text-[16px] font-bold tracking-tight transition-colors", discoverCinematic ? "text-[var(--hv-text-2)] hover:text-[var(--hv-teal)]" : "text-[var(--color-text)] hover:text-[var(--color-primary)]")}>
                  {post.author_name}
                </Link>
                <span className={cn("text-[13px] font-medium tabular-nums", discoverCinematic ? "text-[var(--hv-text-3)]" : "text-[var(--color-meta)]")}>· {formatTimeAgo(post.created_at)}</span>
              </div>
              <Link href={href} className="mt-1 block">
                <h3
                  className={cn(
                    "line-clamp-2 font-bold leading-[1.28] tracking-tight transition-colors",
                    discoverCinematic
                      ? "text-[1.05rem] text-[var(--hv-text-warm)] group-hover:text-[var(--hv-teal)] sm:text-[1.15rem]"
                      : "text-[17px] text-[var(--color-text)] group-hover:text-[var(--color-primary)] sm:text-[1.25rem]",
                  )}
                >
                  {title}
                </h3>
              </Link>
              <p className={cn("mt-1 text-[13px] font-medium", discoverCinematic ? "text-[var(--hv-text-3)]" : "text-[var(--color-meta)]")}>
                {formatCompactCount(post.views_count || 0)} görüntülenme
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="home" />
          </div>
        </>
      }
    />
  );
}
