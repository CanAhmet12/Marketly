"use client";

import Link from "next/link";

import { gridCardTitle } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { homeHrefForSignalPost } from "@/features/home/routing";
import { HomeNativeCreatorHeader, HomeNativeEngagementSlot, HomeNativePostArticle } from "@/features/home/presentation/home-native-post-frame";
import { cn } from "@/lib/cn";

function parseTitleDirection(post: FeedPost): "BUY" | "SELL" | "HOLD" {
  const t = post.title?.trim() ?? "";
  const m = t.match(/\b(BUY|SELL|HOLD)\b/i);
  if (m) return m[1].toUpperCase() as "BUY" | "SELL" | "HOLD";
  return post.content?.toLowerCase().includes("sell") ? "SELL" : "BUY";
}

function parseTimeframe(post: FeedPost): string {
  const hay = `${post.title ?? ""} ${post.content ?? ""}`;
  const m = hay.match(/\b(1m|5m|15m|30m|1h|4h|1g|1d|1w|1G|1H|4H|1D)\b/i);
  if (m) return m[1].toUpperCase();
  return "1G";
}

function cleanTitle(post: FeedPost): string {
  const raw = gridCardTitle(post);
  return raw.replace(/^\[sinyal\]\s*/i, "").trim() || raw;
}

function thesisLine(post: FeedPost): string {
  const body = post.content?.trim() ?? "";
  if (body.length > 0) return body.length > 168 ? `${body.slice(0, 168)}…` : body;
  return cleanTitle(post);
}

type Props = {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
};

export function HomeNativeSignalRow({ post, engagement }: Props) {
  const href = homeHrefForSignalPost(post.id);
  const direction = parseTitleDirection(post);
  const isBuy = direction === "BUY";
  const isHold = direction === "HOLD";
  const sym = (post.asset_tag ?? "").replace(/^#/, "").trim() || "—";
  const tf = parseTimeframe(post);
  const thesis = thesisLine(post);

  return (
    <HomeNativePostArticle tone="surface">
      <HomeNativeCreatorHeader post={post} eyebrow="Sinyal" />
      <div className="ms-home-native-signal mt-4 rounded-xl bg-[color-mix(in_srgb,var(--color-bg-elevated)_48%,transparent)] px-3 py-3.5 shadow-[inset_0_1px_0_color-mix(in_srgb,#fff_6%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_16%,transparent)] sm:px-4 sm:py-4">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <Link
            href={`/results?q=${encodeURIComponent(sym)}`}
            className="text-[1.3125rem] font-bold tabular-nums tracking-[-0.03em] text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)] sm:text-[1.375rem]"
          >
            #{sym}
          </Link>
          <span className="hidden h-4 w-px bg-[color-mix(in_srgb,var(--color-divider)_45%,transparent)] sm:block" aria-hidden />
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                isHold
                  ? "bg-[color-mix(in_srgb,var(--color-meta)_20%,transparent)] text-[var(--color-text-secondary)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_35%,transparent)]"
                  : isBuy
                    ? "bg-[color-mix(in_srgb,var(--color-rise)_18%,transparent)] text-[var(--color-rise)] ring-1 ring-[color-mix(in_srgb,var(--color-rise)_28%,transparent)]"
                    : "bg-[color-mix(in_srgb,var(--color-fall)_18%,transparent)] text-[var(--color-fall)] ring-1 ring-[color-mix(in_srgb,var(--color-fall)_28%,transparent)]",
              )}
            >
              {direction}
            </span>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] px-2 py-1 text-[11px] font-semibold tabular-nums tracking-wide text-[var(--color-meta)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_25%,transparent)]">
              {tf}
            </span>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-primary)] opacity-80 shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]" aria-hidden />
          <p className="min-w-0 flex-1 text-[15px] font-normal leading-relaxed text-[var(--color-text-secondary)] sm:text-[16px] sm:leading-[1.55]">{thesis}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[color-mix(in_srgb,var(--color-divider)_12%,transparent)] pt-3">
          <Link
            href={`/channel/${post.user_id}`}
            className="text-[13px] font-semibold text-[var(--color-meta)] transition-colors hover:text-[var(--color-text)]"
          >
            {post.author_name}
          </Link>
          <Link
            href={href}
            className="inline-flex min-h-10 items-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] px-4 text-[13px] font-semibold text-[var(--color-primary)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_38%,transparent)] transition-[background-color,transform] hover:bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] active:scale-[0.98]"
          >
            Aç
          </Link>
        </div>
      </div>
      <HomeNativeEngagementSlot>
        <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="home" />
      </HomeNativeEngagementSlot>
    </HomeNativePostArticle>
  );
}
