"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc, formatDurationBadge, gridCardTitle, pickDurationSeconds, pickGridThumbnail } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { homeHrefForFeedPost } from "@/features/home/routing";
import { HomeNativeEngagementSlot, HomeNativePostArticle } from "@/features/home/presentation/home-native-post-frame";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

type Kind = "video" | "pulse" | "live";

type Props = {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
  index: number;
  kind: Kind;
};

export function HomeNativeCinematicRow({ post, engagement, index, kind }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumb = pickGridThumbnail(post);
  const title = gridCardTitle(post);
  const href = homeHrefForFeedPost(post);
  const duration = pickDurationSeconds(post);
  const durationBadge = duration ? formatDurationBadge(duration) : null;
  const hash = post.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const viewers = post.views_count || 50 + (hash % 450);

  const stageInner = (
    <>
      <Link href={href} className="absolute inset-0 z-0" aria-label={title}>
        {thumb && !imgFailed ? (
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none group-hover/cine:scale-[1.035]"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className={cn(
              "flex h-full items-center justify-center text-[13px] font-semibold text-white",
              kind === "live" ? "bg-gradient-to-br from-red-600 to-red-900" : "bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)]",
            )}
          >
            {kind === "live" ? "Canlı" : kind === "pulse" ? "Pulse" : "Video"}
          </div>
        )}
      </Link>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-black/25" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[38%] bg-gradient-to-t from-black/70 to-transparent" />
      {kind === "live" ? (
        <span className="absolute left-3 top-3 z-[2] flex items-center gap-1.5 rounded-full bg-red-600/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_4px_20px_rgba(220,38,38,0.45)] backdrop-blur-[2px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
          Canlı
        </span>
      ) : kind === "pulse" ? (
        <span className="absolute left-3 top-3 z-[2] rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/95 shadow-lg backdrop-blur-sm">
          Pulse
        </span>
      ) : null}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out",
          "opacity-[0.42] scale-95 group-hover/cine:opacity-100 group-hover/cine:scale-100",
        )}
      >
        <div className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-white/94 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] ring-1 ring-white/50 sm:h-14 sm:w-14">
          {kind === "live" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-red-600" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="17" height="19" viewBox="0 0 16 18" fill="none" className="ml-0.5" aria-hidden>
              <path d="M1 1.5L15 9L1 16.5V1.5Z" fill="currentColor" className="text-[var(--color-primary)]" />
            </svg>
          )}
        </div>
      </div>
      {durationBadge && kind !== "live" ? (
        <span className="absolute bottom-3 right-3 z-[2] rounded-lg bg-black/72 px-2 py-1 text-[11px] font-semibold tabular-nums text-white/95 shadow-md backdrop-blur-sm">
          {durationBadge}
        </span>
      ) : null}
      {post.views_count != null && post.views_count > 0 ? (
        <span className="absolute bottom-3 left-3 z-[2] flex items-center gap-1 rounded-lg bg-black/72 px-2 py-1 text-[11px] font-semibold text-white/95 shadow-md backdrop-blur-sm">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {formatCompactCount(post.views_count)}
        </span>
      ) : kind === "live" ? (
        <span className="absolute bottom-3 left-3 z-[2] flex items-center gap-1 rounded-lg bg-black/72 px-2 py-1 text-[11px] font-semibold text-white/95 shadow-md backdrop-blur-sm">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {formatCompactCount(viewers)}
        </span>
      ) : null}
    </>
  );

  const ringLive = kind === "live" ? "ring-1 ring-[color-mix(in_srgb,#f87171_42%,transparent)]" : "ring-1 ring-[color-mix(in_srgb,#fff_6%,transparent)]";

  return (
    <HomeNativePostArticle
      tone="flush"
      className="motion-entrance transition-[filter] duration-200"
      style={motionEntranceDelay(index, 28)}
    >
      <div className="group/cine ms-home-native-cinematic overflow-hidden rounded-2xl shadow-[0_2px_0_color-mix(in_srgb,#fff_5%,transparent),0_24px_48px_-28px_rgba(0,0,0,0.75)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_18%,transparent)]">
        <div
          className={cn(
            "relative aspect-[2/1] min-h-[13.5rem] w-full max-w-full overflow-hidden bg-[var(--color-thumb-bg)] sm:aspect-[2.15/1] sm:min-h-[15rem] md:min-h-[17rem]",
            ringLive,
          )}
        >
          {stageInner}
        </div>
        <div className="border-t border-[color-mix(in_srgb,var(--color-divider)_14%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-subtle)_55%,transparent)] px-3 pb-3.5 pt-3.5 backdrop-blur-[6px] sm:px-4 sm:pb-4 sm:pt-4">
          <div className="flex min-w-0 items-start gap-3 sm:gap-3.5">
            <Link href={`/channel/${post.user_id}`} tabIndex={-1} className="shrink-0">
              <SafeAvatar
                src={authorAvatarSrc(post)}
                alt=""
                size={44}
                className={cn(
                  "h-11 w-11 rounded-full ring-1 ring-[color:var(--color-ring-subtle)] shadow-sm",
                  kind === "live" && "ring-2 ring-red-500/45",
                )}
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link
                  href={`/channel/${post.user_id}`}
                  className={cn(
                    "text-[17px] font-bold tracking-[-0.02em] text-[var(--color-text)] transition-colors",
                    kind === "live" ? "hover:text-red-400" : "hover:text-[var(--color-primary)]",
                  )}
                >
                  {post.author_name}
                </Link>
                <span className="text-[12px] font-medium tabular-nums text-[var(--color-meta)] sm:text-[13px]">· {formatTimeAgo(post.created_at)}</span>
              </div>
              <Link href={href} className="mt-1.5 block">
                <h3 className="text-[1.28rem] font-bold leading-[1.2] tracking-[-0.022em] text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)] sm:text-[1.38rem]">
                  {title}
                </h3>
              </Link>
              {post.views_count != null && post.views_count > 0 && kind !== "live" ? (
                <p className="mt-1.5 text-[12px] font-medium text-[var(--color-meta)] sm:text-[13px]">{formatCompactCount(post.views_count)} görüntülenme</p>
              ) : null}
            </div>
          </div>
          <HomeNativeEngagementSlot>
            <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="home" />
          </HomeNativeEngagementSlot>
        </div>
      </div>
    </HomeNativePostArticle>
  );
}
