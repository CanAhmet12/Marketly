"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState, memo } from "react";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc, gridCardTitle, pickGridThumbnail } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { HomeCinematicPostShell } from "@/features/home/presentation/home-post-layout";
import { homeHrefForFeedPost } from "@/features/home/routing";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

export type DiscoverLiveVariant = "featured" | "secondary";

type Props = {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
  index?: number;
  feedSurface?: "default" | "home";
  /** Keşfet: broadcast hub — featured geniş 16:9, secondary kompakt satır */
  discoverLiveVariant?: DiscoverLiveVariant | null;
};

function LiveCardInner({
  post,
  engagement,
  index = 0,
  feedSurface = "default",
  discoverLiveVariant = null,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumb = pickGridThumbnail(post);
  const title = gridCardTitle(post);
  const href = homeHrefForFeedPost(post);
  const home = feedSurface === "home";

  const hash = post.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const viewers = post.views_count != null && post.views_count > 0 ? post.views_count : 50 + (hash % 450);
  const cat = post.asset_tag?.trim();

  if (discoverLiveVariant === "featured" || discoverLiveVariant === "secondary") {
    void engagement;
    const isFeatured = discoverLiveVariant === "featured";

    const thumbBase = (
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
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-950/95 to-[#0a0506] text-[11px] font-semibold uppercase tracking-wide text-white/90">
            CANLI
          </div>
        )}
      </Link>
    );

    const liveBadge = (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wide text-white/95 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]",
          isFeatured
            ? "bg-[color-mix(in_srgb,#991b1b_88%,#0c0a0a)] px-2 py-1 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]"
            : "bg-[color-mix(in_srgb,#7f1d1d_82%,#0c0a0a)] px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-0.5 sm:text-[10px]",
        )}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0 sm:h-2 sm:w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-200/50 opacity-50 motion-reduce:animate-none" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-100 sm:h-2 sm:w-2" />
        </span>
        Canlı
      </span>
    );

    const topMeta = (
      <div
        className={cn(
          "pointer-events-none absolute left-0 right-0 top-0 z-[1] flex flex-wrap items-start justify-between gap-2 bg-gradient-to-b from-black/55 to-transparent p-2 sm:p-3",
          isFeatured ? "pb-8" : "pb-6",
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
          {liveBadge}
          {cat ? (
            <span className="max-w-[40%] truncate rounded-md bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/88 backdrop-blur-sm sm:max-w-[50%] sm:text-[10px]">
              {cat}
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-white/92 backdrop-blur-sm sm:px-2 sm:py-1 sm:text-[10px]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-90" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {formatCompactCount(viewers)}
        </div>
      </div>
    );

    const watchCta = (
      <Link
        href={href}
        className={cn(
          "pointer-events-auto inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/[0.08] font-semibold uppercase tracking-wide text-white/95 backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/[0.14]",
          isFeatured ? "px-3 py-2 text-[11px] sm:text-[12px]" : "px-2 py-1.5 text-[10px]",
        )}
      >
        <svg width={isFeatured ? 12 : 10} height={isFeatured ? 12 : 10} viewBox="0 0 24 24" fill="currentColor" className="text-red-100/95" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
        İzle
      </Link>
    );

    const creatorFooter = (
      <div
        className={cn(
          "flex items-center gap-2.5 border-t border-white/[0.08] bg-[color-mix(in_srgb,#030712_88%,#1c0a0a)]",
          isFeatured ? "px-3 py-2.5 sm:px-4 sm:py-3" : "px-2.5 py-2 sm:px-3",
        )}
      >
        <Link href={`/channel/${post.user_id}`} className="shrink-0" tabIndex={-1}>
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt=""
            size={isFeatured ? 40 : 32}
            className={cn("rounded-full ring-1 ring-red-400/35", isFeatured ? "h-10 w-10" : "h-8 w-8")}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/channel/${post.user_id}`} className={cn("block truncate font-semibold text-white/95 hover:text-red-100", isFeatured ? "text-[13px] sm:text-sm" : "text-[12px]")}>
            {post.author_name}
          </Link>
          <p className={cn("truncate text-white/45", isFeatured ? "text-[11px]" : "text-[10px]")}>
            {formatCompactCount(viewers)} izleyici · {formatTimeAgo(post.created_at)}
          </p>
        </div>
      </div>
    );

    if (isFeatured) {
      return (
        <article
          className="group relative w-full min-w-0 overflow-hidden rounded-xl bg-[#050508] shadow-[0_16px_48px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.09] transition-[box-shadow,transform] duration-200 ease-out hover:ring-white/14 motion-entrance motion-reduce:transition-none sm:rounded-[0.9rem]"
          style={motionEntranceDelay(index)}
        >
          <div className="relative aspect-video w-full max-w-full">
            {thumbBase}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/88 via-black/40 to-transparent" />
            {topMeta}
            <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-col justify-end p-3 sm:p-4">
              <div className="flex items-end justify-between gap-3">
                <div className="pointer-events-none min-w-0 flex-1 pr-2">
                  <p className={cn("line-clamp-2 font-bold leading-snug text-white drop-shadow", "text-[0.95rem] sm:text-[1.05rem] lg:max-w-[90%]")}>{title}</p>
                </div>
                {watchCta}
              </div>
            </div>
          </div>
          {creatorFooter}
        </article>
      );
    }

    return (
      <article
        className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-lg bg-[#050508] ring-1 ring-white/[0.07] transition-[box-shadow,ring-color] duration-200 hover:ring-red-400/20 motion-entrance motion-reduce:transition-none"
        style={motionEntranceDelay(index)}
      >
        <div className="relative aspect-video w-full">
          {thumbBase}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/82 via-black/28 to-transparent" />
          {topMeta}
          <div className="absolute inset-x-0 bottom-0 z-[1] flex items-end justify-between gap-2 p-2 sm:p-2.5">
            <p className="pointer-events-none line-clamp-1 min-w-0 flex-1 pr-2 text-[11px] font-semibold leading-snug text-white drop-shadow sm:text-[12px]">{title}</p>
            {watchCta}
          </div>
        </div>
        {creatorFooter}
      </article>
    );
  }

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
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-[12px] font-semibold text-white">
            Canlı
          </div>
        )}
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
      <span className="discover-live-badge absolute left-2 top-2 z-[1] flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold uppercase text-white shadow-md">
        <span className="discover-live-dot h-1.5 w-1.5 rounded-full bg-white" />
        Canlı
      </span>
      <span className="absolute bottom-2 left-2 z-[1] flex items-center gap-1 rounded-md bg-black/78 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {formatCompactCount(viewers)}
      </span>
      <div className="absolute bottom-2 right-2 z-[1] flex h-7 w-7 items-center justify-center rounded-full bg-white/92 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden className="text-red-600">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </>
  );

  if (home) {
    return (
      <HomeCinematicPostShell
        className="group motion-entrance transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_4%,var(--color-bg-subtle))]"
        style={motionEntranceDelay(index)}
        stage={
          <div className="relative aspect-video w-full min-h-[11.5rem] max-w-full bg-[var(--color-thumb-bg)] ring-1 ring-[color-mix(in_srgb,#f87171_28%,transparent)] sm:min-h-0 sm:ring-red-500/20">
            {thumbInner}
          </div>
        }
        below={
          <>
            <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
              <Link href={`/channel/${post.user_id}`} tabIndex={-1} className="shrink-0">
                <SafeAvatar src={authorAvatarSrc(post)} alt="" size={40} className="h-10 w-10 rounded-full ring-2 ring-red-500/35" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <Link href={`/channel/${post.user_id}`} className="text-[16px] font-bold tracking-tight text-[var(--color-text)] hover:text-red-500">
                    {post.author_name}
                  </Link>
                  <span className="text-[13px] font-medium tabular-nums text-[var(--color-meta)]">· {formatTimeAgo(post.created_at)}</span>
                </div>
                <Link href={href} className="mt-1 block">
                  <h3 className="line-clamp-2 text-[17px] font-bold leading-[1.28] tracking-tight text-[var(--color-text)] transition-colors group-hover:text-red-500 sm:text-[1.25rem]">
                    {title}
                  </h3>
                </Link>
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

  void engagement;

  return (
    <article
      className="discover-live-card group flex w-full max-w-[220px] flex-col motion-entrance"
      style={motionEntranceDelay(index)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-thumb-bg)] shadow-[0_4px_16px_rgba(220,38,38,0.22)] ring-1 ring-red-600/25 transition-all duration-200 ease-out group-hover:shadow-[0_8px_28px_rgba(220,38,38,0.35)] group-active:scale-[0.99]">
        {thumbInner}
      </div>

      <div className="mt-[var(--sp-2)] flex gap-2">
        <SafeAvatar src={authorAvatarSrc(post)} alt="" size={32} className="h-8 w-8 shrink-0 rounded-full ring-2 ring-red-600/45" />
        <div className="min-w-0 flex-1">
          <Link href={href} className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--color-text)] transition-colors hover:text-red-600">
            {title}
          </Link>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[var(--color-meta)]">{post.author_name}</p>
        </div>
      </div>
    </article>
  );
}

export const LiveCard = memo(LiveCardInner);
