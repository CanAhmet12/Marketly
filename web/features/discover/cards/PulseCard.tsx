"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState, memo } from "react";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import {
  authorAvatarSrc,
  formatDurationBadge,
  gridCardTitle,
  pickDurationSeconds,
  pickGridThumbnail,
} from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { HomeCinematicPostShell } from "@/features/home/presentation/home-post-layout";
import { homeHrefForFeedPost } from "@/features/home/routing";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

export type DiscoverPulseTier = "featured" | "medium" | "rail";

type Props = {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
  index?: number;
  feedSurface?: "default" | "home";
  /** @deprecated Keşfet — `discoverTier` kullanın (9:16). */
  discoverVariant?: "hero" | null;
  /** Keşfet: 9:16 — `featured` çift vitrin, `medium` ana ızgara, `rail` kompakt şerit */
  discoverTier?: DiscoverPulseTier | null;
};

function PulseDiscoverFrame({
  post,
  engagement,
  href,
  title,
  thumb,
  imgFailed,
  setImgFailed,
  tier,
  index,
}: {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
  href: string;
  title: string;
  thumb: string | null;
  imgFailed: boolean;
  setImgFailed: (v: boolean) => void;
  tier: DiscoverPulseTier;
  index: number;
}) {
  const durSec = pickDurationSeconds(post);
  const durLabel = durSec ? formatDurationBadge(durSec) : null;
  const tag = post.asset_tag?.trim();

  const frameClass =
    tier === "featured"
      ? "mx-auto w-full max-w-[min(16.5rem,calc(50vw-1rem))] sm:max-w-[min(17rem,24vw)]"
      : tier === "medium"
        ? "mx-auto w-full max-w-[min(11.25rem,calc(33vw-0.75rem))] sm:max-w-[min(12rem,18vw)]"
        : "w-[min(10rem,calc(44vw-0.5rem))] sm:w-[min(10.75rem,15vw)]";

  const playWrap =
    tier === "featured"
      ? "h-8 w-8 opacity-30 group-hover:opacity-85"
      : tier === "medium"
        ? "h-7 w-7 opacity-28 group-hover:opacity-80"
        : "h-7 w-7 opacity-25 group-hover:opacity-75";

  return (
    <article
      className={cn("discover-pulse-discover group flex flex-col motion-entrance", (tier === "featured" || tier === "medium") && "min-w-0")}
      style={motionEntranceDelay(index)}
    >
      <div
        className={cn(
          "relative mx-auto aspect-[9/16] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-thumb-bg)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary)_18%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition-[transform,box-shadow] duration-200 ease-out group-hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary)_32%,transparent),0_12px_40px_rgba(0,0,0,0.35)] motion-reduce:transition-none",
          frameClass,
        )}
      >
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
            <div className="flex h-full items-center justify-center bg-gradient-to-b from-[color-mix(in_srgb,var(--color-primary)_35%,#0a0a12)] to-[#07080d] text-[11px] font-semibold uppercase tracking-wide text-white/90">
              Pulse
            </div>
          )}
        </Link>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <span className="pointer-events-none absolute left-2 top-2 z-[1] rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/95 backdrop-blur-sm">
          Pulse
        </span>
        {tag ? (
          <span className="pointer-events-none absolute right-2 top-2 z-[1] max-w-[40%] truncate rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            {tag}
          </span>
        ) : null}
        <div className="pointer-events-none absolute left-2 right-2 bottom-2 z-[1] flex items-end justify-between gap-2 text-[10px] font-semibold text-white">
          <span className="line-clamp-1 min-w-0 flex-1 text-[10px] drop-shadow">{title}</span>
          <div className="flex shrink-0 flex-col items-end gap-0.5 text-[9px] tabular-nums">
            {durLabel ? <span className="rounded bg-black/55 px-1 py-0.5">{durLabel}</span> : null}
            {post.views_count != null && post.views_count > 0 ? (
              <span className="rounded bg-black/55 px-1 py-0.5">{formatCompactCount(post.views_count)}</span>
            ) : null}
          </div>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200">
          <div className={cn("flex items-center justify-center rounded-full bg-white/88 shadow-md", playWrap)}>
            <svg
              width={tier === "featured" ? 12 : 10}
              height={tier === "featured" ? 14 : 11}
              viewBox="0 0 14 16"
              fill="none"
              className="ml-0.5"
              aria-hidden
            >
              <path d="M1 1.5L13 8L1 14.5V1.5Z" fill="currentColor" className="text-[var(--color-primary)]" />
            </svg>
          </div>
        </div>
      </div>

      <div className={cn("mt-2 flex min-w-0 items-start gap-2", tier === "rail" && "px-0.5")}>
        <Link href={`/channel/${post.user_id}`} tabIndex={-1} className="shrink-0">
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt=""
            size={tier === "featured" ? 32 : 28}
            className={cn(
              "rounded-full ring-1",
              tier === "featured" ? "h-8 w-8 ring-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]" : "h-7 w-7 ring-[color:var(--color-ring-subtle)]",
            )}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <Link
              href={`/channel/${post.user_id}`}
              className={cn(
                "truncate font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)]",
                tier === "featured" ? "text-[12px]" : "text-[11px]",
              )}
            >
              {post.author_name}
            </Link>
            <span className="text-[9px] font-medium tabular-nums text-[var(--color-meta)]">{formatTimeAgo(post.created_at)}</span>
          </div>
        </div>
        <button
          type="button"
          className={cn(
            "shrink-0 text-[12px] transition-colors",
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

      {tier === "featured" ? (
        <div className="mt-1.5">
          <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="home" />
        </div>
      ) : null}
    </article>
  );
}

function PulseCardInner({
  post,
  engagement,
  index = 0,
  feedSurface = "default",
  discoverVariant = null,
  discoverTier = null,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumb = pickGridThumbnail(post);
  const title = gridCardTitle(post);
  const href = homeHrefForFeedPost(post);
  const home = feedSurface === "home";

  if (discoverTier) {
    return (
      <PulseDiscoverFrame
        post={post}
        engagement={engagement}
        href={href}
        title={title}
        thumb={thumb}
        imgFailed={imgFailed}
        setImgFailed={setImgFailed}
        tier={discoverTier}
        index={index}
      />
    );
  }

  const thumbBlock = (
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
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] text-[10px] font-semibold text-white">
            Pulse
          </div>
        )}
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200",
          home ? "opacity-40 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg">
          <svg width="12" height="14" viewBox="0 0 14 16" fill="none" className="ml-0.5" aria-hidden>
            <path d="M1 1.5L13 8L1 14.5V1.5Z" fill="currentColor" className="text-[var(--color-primary)]" />
          </svg>
        </div>
      </div>
      <span className="absolute bottom-1.5 left-1.5 z-[1] rounded-md bg-black/78 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
        Pulse
      </span>
      {post.views_count && post.views_count > 0 ? (
        <span className="absolute bottom-1.5 right-1.5 z-[1] flex items-center gap-0.5 rounded-md bg-black/78 px-1 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {formatCompactCount(post.views_count)}
        </span>
      ) : null}
    </>
  );

  if (home) {
    const hero = discoverVariant === "hero";
    return (
      <HomeCinematicPostShell
        className={cn(
          "group motion-entrance transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_4%,var(--color-bg-subtle))]",
          hero && "discover-pulse--hero",
        )}
        style={motionEntranceDelay(index)}
        stage={
          <div
            className={cn(
              "relative w-full max-w-full bg-[var(--color-thumb-bg)]",
              hero
                ? "aspect-[9/16] max-h-[min(72vh,520px)] min-h-[14rem] w-[min(100%,280px)] mx-auto sm:min-h-[16rem]"
                : "aspect-[9/16] max-h-[min(56vh,420px)] min-h-[12rem] w-[min(100%,220px)] mx-auto sm:min-h-[13rem]",
            )}
          >
            {thumbBlock}
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
                  <Link
                    href={`/channel/${post.user_id}`}
                    className={cn(
                      "font-bold tracking-tight text-[var(--color-text)] hover:text-[var(--color-primary)]",
                      hero ? "text-[15px] sm:text-[16px]" : "text-[16px]",
                    )}
                  >
                    {post.author_name}
                  </Link>
                  <span className={cn("font-medium tabular-nums text-[var(--color-meta)]", hero ? "text-[12px]" : "text-[13px]")}>
                    · {formatTimeAgo(post.created_at)}
                  </span>
                </div>
                <Link href={href} className="mt-1 block">
                  <h3
                    className={cn(
                      "line-clamp-3 font-bold leading-[1.22] tracking-[-0.02em] text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]",
                      hero ? "text-[clamp(1.05rem,2vw,1.25rem)] sm:line-clamp-4" : "text-[15px] sm:text-[1.05rem]",
                    )}
                  >
                    {title}
                  </h3>
                </Link>
              </div>
            </div>
            <div className={cn("mt-2.5", hero && "mt-2")}>
              <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="home" />
            </div>
          </>
        }
      />
    );
  }

  return (
    <article
      className="discover-pulse-card group flex w-full max-w-[140px] flex-col motion-entrance"
      style={motionEntranceDelay(index)}
    >
      <div className="relative mx-auto aspect-[9/16] w-full max-w-[120px] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-thumb-bg)] shadow-[0_4px_16px_rgba(0,0,0,0.16)] ring-1 ring-[color:var(--color-ring-subtle)] transition-all duration-200 ease-out group-hover:scale-[1.02] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.24)] group-active:scale-[0.98]">
        {thumbBlock}
      </div>

      <div className="mt-[var(--sp-2)] flex items-start gap-1.5 px-0.5">
        <SafeAvatar
          src={authorAvatarSrc(post)}
          alt=""
          size={22}
          className="h-5 w-5 shrink-0 rounded-full ring-1 ring-[color:var(--color-ring-subtle)]"
        />
        <p className="line-clamp-2 min-w-0 flex-1 text-[11px] font-semibold leading-snug text-[var(--color-text)]">{title}</p>
        <button
          type="button"
          className={cn(
            "shrink-0 text-[12px] transition-colors",
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

export const PulseCard = memo(PulseCardInner);
