"use client";

/* eslint-disable @next/next/no-img-element -- grid önizleme */

import Link from "next/link";
import { useState, memo } from "react";
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
  feedSurface?: "default" | "home";
  /** Kanal profili — büyük thumb, sade meta (avatar yok) */
  surface?: "discover" | "channel";
};

function VideoCardInner({ post, engagement, index = 0, feedSurface = "default", surface = "discover" }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumb = pickGridThumbnail(post);
  const title = gridCardTitle(post);
  const href = homeHrefForFeedPost(post);
  const duration = pickDurationSeconds(post);
  const durationBadge = duration ? formatDurationBadge(duration) : null;
  const home = feedSurface === "home";

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
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] text-[12px] font-semibold text-white">
            Video
          </div>
        )}
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent" />
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200",
          home ? "opacity-[0.45] group-hover:opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/92 shadow-lg sm:h-12 sm:w-12">
          <svg width="15" height="17" viewBox="0 0 16 18" fill="none" className="ml-0.5" aria-hidden>
            <path d="M1 1.5L15 9L1 16.5V1.5Z" fill="currentColor" className="text-[var(--color-primary)]" />
          </svg>
        </div>
      </div>
      {durationBadge ? (
        <span className="absolute bottom-2 right-2 z-[1] rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
          {durationBadge}
        </span>
      ) : null}
      {post.views_count && post.views_count > 0 ? (
        <span className="absolute bottom-2 left-2 z-[1] flex items-center gap-0.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {formatCompactCount(post.views_count)}
        </span>
      ) : null}
    </>
  );

  if (home) {
    return (
      <HomeCinematicPostShell
        className="group motion-entrance transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_4%,var(--color-bg-subtle))]"
        style={motionEntranceDelay(index)}
        stage={
          <div
            className={cn(
              "relative aspect-[2/1] w-full min-h-[11.5rem] max-w-full bg-[var(--color-thumb-bg)] sm:aspect-video sm:min-h-0",
              "transition-[box-shadow,ring-color] duration-200 ease-out group-hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
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
                  <Link href={`/channel/${post.user_id}`} className="text-[16px] font-bold tracking-tight text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]">
                    {post.author_name}
                  </Link>
                  <span className="text-[13px] font-medium tabular-nums text-[var(--color-meta)]">· {formatTimeAgo(post.created_at)}</span>
                </div>
                <Link href={href} className="mt-1 block">
                  <h3 className="text-[17px] font-bold leading-[1.28] tracking-tight text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)] sm:text-[1.25rem]">
                    {title}
                  </h3>
                </Link>
                <p className="mt-1 text-[13px] font-medium text-[var(--color-meta)]">{formatCompactCount(post.views_count || 0)} görüntülenme</p>
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

  if (surface === "channel") {
    return (
      <article
        className="ch-video-tile group flex w-full flex-col motion-entrance"
        style={motionEntranceDelay(index)}
      >
        <div className="ch-video-tile__thumb relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-thumb-bg)] ring-1 ring-[color:var(--color-border)] transition-[transform,box-shadow] duration-200 ease-out group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.14)] group-hover:-translate-y-0.5">
          {thumbInner}
        </div>
        <div className="ch-video-tile__meta">
          <Link
            href={href}
            className="ch-video-tile__title line-clamp-2 text-[15px] font-semibold leading-[1.4] tracking-[-0.01em] text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
          >
            {title}
          </Link>
          <p className="ch-video-tile__stats mt-1.5 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">
            {formatCompactCount(post.views_count || 0)} görüntülenme
            <span className="mx-1.5 opacity-40" aria-hidden>
              ·
            </span>
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className="discover-video-card group flex w-full max-w-[220px] flex-col motion-entrance"
      style={motionEntranceDelay(index)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-thumb)] bg-[var(--color-thumb-bg)] shadow-[0_2px_12px_rgba(0,0,0,0.12)] ring-1 ring-[color:var(--color-ring-subtle)] transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] group-active:translate-y-0">
        {thumbInner}
      </div>

      <div className="mt-[var(--sp-2)] flex gap-2">
        <SafeAvatar
          src={authorAvatarSrc(post)}
          alt=""
          size={32}
          className="h-8 w-8 shrink-0 rounded-full ring-1 ring-[color:var(--color-ring-subtle)]"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={href}
            className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
          >
            {title}
          </Link>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[var(--color-meta)]">{post.author_name}</p>
          <p className="mt-0.5 text-[10px] font-medium text-[var(--color-meta)]">
            {formatCompactCount(post.views_count || 0)} görüntülenme · {formatTimeAgo(post.created_at)}
          </p>
        </div>
        <button
          type="button"
          className={cn(
            "shrink-0 text-[12px] font-semibold transition-colors",
            post.is_liked ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]",
          )}
          onClick={() => {
            if (!engagement.isLoggedIn) engagement.onRequireAuth?.();
            else engagement.onToggleLike(post);
          }}
          aria-label={post.is_liked ? "Unlike" : "Like"}
        >
          ♥
        </button>
      </div>
    </article>
  );
}

export const VideoCard = memo(VideoCardInner);
