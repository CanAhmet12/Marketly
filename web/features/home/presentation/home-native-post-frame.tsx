"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

function tierShort(post: FeedPost): string | null {
  const t = (post.author_tier ?? "").toLowerCase();
  if (t === "elite") return "Elite";
  if (t === "pro") return "Pro";
  return null;
}

function tierPillClass(tier: string): string {
  if (tier === "elite")
    return "bg-[color-mix(in_srgb,var(--color-tier-elite)_22%,transparent)] text-[var(--color-tier-elite)] ring-1 ring-[color-mix(in_srgb,var(--color-tier-elite)_38%,transparent)]";
  if (tier === "pro")
    return "bg-[color-mix(in_srgb,var(--color-tier-pro)_18%,transparent)] text-[var(--color-tier-pro)] ring-1 ring-[color-mix(in_srgb,var(--color-tier-pro)_32%,transparent)]";
  return "";
}

export type HomeNativePostTone = "surface" | "flush";

export function HomeNativePostArticle({
  children,
  className,
  style,
  tone = "surface",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** surface: yumuşak yükseltilmiş gövde; flush: sinematik tam genişlik kartı */
  tone?: HomeNativePostTone;
}) {
  return (
    <article
      className={cn(
        "ms-home-native-post group min-w-0",
        tone === "surface" && "ms-home-native-surf rounded-2xl px-2.5 py-3 sm:px-3.5 sm:py-3.5",
        tone === "flush" && "min-w-0",
        className,
      )}
      style={style}
    >
      {children}
    </article>
  );
}

type CreatorHeaderProps = {
  post: FeedPost;
  eyebrow?: ReactNode;
  metaLine?: ReactNode;
};

export function HomeNativeCreatorHeader({ post, eyebrow, metaLine }: CreatorHeaderProps) {
  const tier = tierShort(post);
  return (
    <div className="flex min-w-0 gap-3.5 sm:gap-4">
      <Link
        href={`/channel/${post.user_id}`}
        tabIndex={-1}
        className="relative shrink-0 pt-0.5 transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.99]"
      >
        <span
          className="absolute -inset-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] opacity-0 blur-sm transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        />
        <SafeAvatar
          src={authorAvatarSrc(post)}
          alt=""
          size={56}
          className="relative h-14 w-14 rounded-full ring-2 ring-[color-mix(in_srgb,var(--color-primary)_22%,var(--color-divider)_40%)] shadow-[0_6px_24px_-8px_rgba(0,0,0,0.65)] sm:h-16 sm:w-16"
        />
      </Link>
      <div className="min-w-0 flex-1 pt-0.5">
        {eyebrow ? (
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-meta)]">{eyebrow}</div>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Link
            href={`/channel/${post.user_id}`}
            className="text-[1.1875rem] font-bold leading-tight tracking-[-0.025em] text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)] sm:text-[1.25rem]"
          >
            {post.author_name}
          </Link>
          {tier ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                tierPillClass(post.author_tier),
              )}
            >
              {tier}
            </span>
          ) : null}
          <span className="text-[12px] font-medium tracking-tight text-[var(--color-text-tertiary)] sm:text-[13px]">{post.author_handle}</span>
          <span className="text-[12px] font-medium tabular-nums text-[var(--color-meta)] sm:text-[13px]">· {formatTimeAgo(post.created_at)}</span>
        </div>
        {metaLine}
        {post.asset_tag ? (
          <Link
            href={`/results?q=${encodeURIComponent(post.asset_tag.replace(/^#/, ""))}`}
            className="mt-2 inline-flex max-w-full items-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] px-2.5 py-1 text-[13px] font-semibold text-[var(--color-primary)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
          >
            #{post.asset_tag.replace(/^#/, "")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function HomeNativeEngagementSlot({ children }: { children: ReactNode }) {
  return (
    <div className="ms-home-native-engagement-slot mt-3.5 border-t border-[color-mix(in_srgb,var(--color-divider)_12%,transparent)] pt-3.5 sm:mt-4 sm:pt-4">
      {children}
    </div>
  );
}
