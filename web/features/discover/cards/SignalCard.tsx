"use client";

import Link from "next/link";
import { useMemo, memo } from "react";
import { useRouter } from "next/navigation";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc, gridCardTitle } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { homeHrefForSignalPost } from "@/features/home/routing";
import { DiscoverSignalIntelligenceRow } from "@/features/discover/cards/DiscoverSignalIntelligenceRow";
import { getSignalsRepository } from "@/features/signals/repository";
import { UnifiedSignalCompactCard } from "@/features/signals/components/unified-signal-primitives";
import { mapSignalsPageRowToFeedRow } from "@/features/signals/lib/map-page-row-to-feed-row";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
  index?: number;
  feedSurface?: "default" | "home";
  /** Keşfet — trading desk intelligence satırı (UnifiedSignalCompactCard yerine) */
  discoverIntel?: boolean;
};

function parseTitleDirection(post: FeedPost): "BUY" | "SELL" | "HOLD" {
  const t = post.title?.trim() ?? "";
  const m = t.match(/\b(BUY|SELL|HOLD)\b/i);
  if (m) return m[1].toUpperCase() as "BUY" | "SELL" | "HOLD";
  return post.content?.toLowerCase().includes("sell") ? "SELL" : "BUY";
}

function SignalCardInner({
  post,
  engagement,
  feedSurface = "default",
  index: _index = 0,
  discoverIntel = false,
}: Props) {
  void _index;
  const router = useRouter();
  const href = homeHrefForSignalPost(post.id);
  const title = gridCardTitle(post);
  const body = post.content?.trim() || "";
  const home = feedSurface === "home";

  const feedRow = useMemo(() => {
    return getSignalsRepository().getFeedRows().find((r) => r.id === post.id) ?? null;
  }, [post.id]);

  const fallbackRow = useMemo(() => {
    if (feedRow || !isMockDataEnabled()) return null;
    const sym = (post.asset_tag ?? "").replace(/^#/, "").trim() || "—";
    const direction = parseTitleDirection(post);
    const analyst = {
      id: post.user_id,
      display: post.author_name,
      avatar_url: authorAvatarSrc(post),
      verified: false,
      follower_count: 0,
      accuracy: null as number | null,
      specialties: null as string[] | null,
      tier: post.author_tier ?? "free",
      strategy_style: null as string | null,
    };
    const pageRow = {
      id: post.id,
      creator_id: post.user_id,
      asset_id: sym,
      symbol: sym,
      direction,
      confidence: 55,
      entry_price: null,
      target_price: null,
      stop_loss: null,
      timeframe: "1G",
      rationale: body || title,
      is_active: true,
      copies_count: 0,
      likes_count: post.likes,
      created_at: post.created_at,
      result: null,
      creator_display: post.author_name,
      asset_display_name: sym,
      detail_href: `/signals?asset=${encodeURIComponent(sym)}`,
    };
    return mapSignalsPageRowToFeedRow(pageRow, analyst);
  }, [feedRow, post, body, title]);

  const row = feedRow ?? fallbackRow;

  if (discoverIntel && row) {
    return <DiscoverSignalIntelligenceRow row={row} post={post} engagement={engagement} />;
  }

  if (row) {
    return (
      <div
        className={cn(
          "overflow-hidden",
          home
            ? "rounded-2xl bg-[color-mix(in_srgb,var(--color-bg-elevated)_45%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_50%,transparent)]"
            : "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
        )}
      >
        <UnifiedSignalCompactCard
          embedded
          homeTone={home}
          row={row}
          onActivate={() => {
            void router.push(href);
          }}
        />
        <div
          className={cn(
            "border-t px-[var(--sp-3)] py-2",
            home ? "border-[color-mix(in_srgb,var(--color-divider)_50%,transparent)]" : "border-[var(--color-border)]",
          )}
        >
          <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant={home ? "home" : "default"} />
        </div>
      </div>
    );
  }

  const direction = parseTitleDirection(post);
  const isBuy = direction === "BUY";

  return (
    <article
      className={cn(
        "group relative transition-colors",
        home
          ? "rounded-2xl px-3 py-3.5 sm:px-4 sm:py-4 hover:bg-[color-mix(in_srgb,var(--color-text)_5%,var(--color-bg-subtle))]"
          : "bg-[var(--color-bg)] px-[var(--sp-4)] py-[var(--sp-4)] hover:bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-bg))]",
      )}
    >
      <div className={cn("flex", home ? "gap-3 sm:gap-4" : "gap-[var(--sp-3)]")}>
        <Link href={`/channel/${post.user_id}`} tabIndex={-1} className="shrink-0 transition-transform hover:scale-[1.02]">
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt=""
            size={home ? 48 : 44}
            className={cn("rounded-full ring-1 ring-[color:var(--color-ring-subtle)]", home ? "h-12 w-12" : "h-11 w-11")}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/channel/${post.user_id}`}
              className={cn(
                "font-bold text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]",
                home ? "text-[16px] leading-tight tracking-tight" : "text-[15px] leading-none",
              )}
            >
              {post.author_name}
            </Link>
            <span className="text-[13px] font-medium text-[var(--color-muted)]">{post.author_handle}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                isBuy
                  ? "bg-[color-mix(in_srgb,var(--color-rise)_14%,transparent)] text-[var(--color-rise)]"
                  : "bg-[color-mix(in_srgb,var(--color-fall)_14%,transparent)] text-[var(--color-fall)]",
              )}
            >
              {direction}
            </span>
          </div>
          {post.asset_tag ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Link
                href={`/results?q=${encodeURIComponent(post.asset_tag.replace(/^#/, ""))}`}
                className={cn(
                  "inline-block font-bold tabular-nums tracking-tight text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]",
                  home ? "text-[15px]" : "text-[16px]",
                )}
              >
                #{post.asset_tag.replace(/^#/, "")}
              </Link>
              <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">
                Sinyal
              </span>
            </div>
          ) : null}
          <Link href={href} className="mt-2 block group/content">
            {title ? (
              <h3
                className={cn(
                  "font-bold tracking-[-0.02em] text-[var(--color-text)] transition-colors group-hover/content:text-[var(--color-primary)]",
                  home ? "text-[1.0625rem] leading-snug" : "text-[17px] leading-[1.35] group-hover/content:text-[var(--color-primary-dark)]",
                )}
              >
                {title}
              </h3>
            ) : null}
            {body ? (
              <p
                className={cn(
                  "mt-2 text-[15px] font-normal leading-[1.62] text-[var(--color-text-secondary)]",
                  !home && "max-w-[min(100%,42rem)]",
                )}
                style={{ lineClamp: 3, WebkitLineClamp: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}
              >
                {body}
              </p>
            ) : null}
          </Link>
          {home ? (
            <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="home" />
          ) : (
            <div className="mt-[var(--sp-3)] flex flex-wrap items-center gap-x-[var(--sp-4)] gap-y-1.5">
              <button
                type="button"
                className={cn(
                  "group/btn flex items-center gap-1.5 text-[13px] font-semibold transition-colors",
                  post.is_liked ? "text-[var(--color-primary)]" : "text-[var(--color-meta)] hover:text-[var(--color-text)]",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  if (!engagement.isLoggedIn) engagement.onRequireAuth?.();
                  else engagement.onToggleLike(post);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {formatCompactCount(post.likes)}
              </button>
              <Link href={href} className="group/btn flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-meta)] transition-colors hover:text-[var(--color-text)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {formatCompactCount(post.comments)}
              </Link>
              <button
                type="button"
                className="group/btn flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-meta)] transition-colors hover:text-[var(--color-text)]"
                onClick={(e) => {
                  e.preventDefault();
                  if (!engagement.isLoggedIn) engagement.onRequireAuth?.();
                  else engagement.onToggleSave(post);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={post.is_saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export const SignalCard = memo(SignalCardInner);
