"use client";

import Link from "next/link";
import { memo } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

type Props = {
  post: FeedPost;
  index?: number;
  /** `editorial`: Home / Keşfet hv-ref yüzeyi — yumuşak hiyerarşi, agresif grid kartı değil */
  variant?: "default" | "editorial";
};

function CreatorCardInner({ post, index = 0, variant = "default" }: Props) {
  const href = `/channel/${post.user_id}`;
  const editorial = variant === "editorial";

  const hash = post.user_id?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  const successRate = 70 + (hash % 31);
  const followers = post.views_count || (1000 + (hash % 9000));

  if (editorial) {
    return (
      <article
        className="group flex w-full max-w-[11.5rem] flex-col motion-entrance sm:max-w-none"
        style={motionEntranceDelay(index)}
      >
        <Link href={href} className="flex flex-col transition-opacity duration-200 hover:opacity-[0.92]">
          <div className="relative mx-auto">
            <SafeAvatar
              src={authorAvatarSrc(post)}
              alt=""
              size={72}
              className="h-[4.25rem] w-[4.25rem] rounded-full ring-1 ring-[color-mix(in_srgb,var(--hv-text)_14%,transparent)] sm:h-[4.5rem] sm:w-[4.5rem]"
            />
            {successRate >= 75 ? (
              <div className="absolute -bottom-0.5 -right-0.5 flex h-6 min-w-[1.35rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--hv-text)_12%,transparent)] bg-[color-mix(in_srgb,var(--hv-bg-mid)_88%,var(--hv-teal)_12%)] px-1 text-[0.625rem] font-semibold tabular-nums text-[var(--hv-text-2)]">
                {successRate}
              </div>
            ) : null}
          </div>
          <p className="mt-[var(--hv-s-3)] line-clamp-2 text-center text-[0.8125rem] font-semibold leading-snug text-[var(--hv-text)] transition-colors group-hover:text-[var(--hv-text-warm)]">
            {post.author_name}
          </p>
          <p className="mt-1 text-center text-[0.6875rem] font-medium tabular-nums text-[var(--hv-text-3)]">{formatCompactCount(followers)} takipçi</p>
          {successRate >= 85 ? (
            <span className="mt-[var(--hv-s-2)] inline-flex items-center justify-center gap-0.5 self-center rounded-full border border-[var(--hv-sep)] px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-[var(--hv-text-2)]">
              PRO
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          className="mt-[var(--hv-s-3)] w-full rounded-md border border-[color-mix(in_srgb,var(--hv-text)_16%,transparent)] bg-transparent px-3 py-1.5 text-[0.75rem] font-semibold text-[var(--hv-text-2)] transition-colors hover:border-[color-mix(in_srgb,var(--hv-teal)_45%,transparent)] hover:text-[var(--hv-text)]"
        >
          Takip et
        </button>
      </article>
    );
  }

  return (
    <article
      className="discover-creator-card group flex flex-col items-center motion-entrance"
      style={motionEntranceDelay(index)}
    >
      <Link href={href} className="flex flex-col items-center transition-transform duration-200 hover:scale-105 active:scale-95">
        <div className="relative">
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt=""
            size={64}
            className="h-16 w-16 rounded-full ring-2 ring-[var(--color-primary)] shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          />

          {successRate >= 75 ? (
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-white shadow-md ring-2 ring-white">
              {successRate}
            </div>
          ) : null}
        </div>

        <p className="mt-[var(--sp-2)] max-w-[120px] truncate text-center text-[13px] font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
          {post.author_name}
        </p>

        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[var(--color-meta)]">
          <span>{formatCompactCount(followers)} takipçi</span>
        </div>

        {successRate >= 85 ? (
          <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            PRO
          </span>
        ) : null}
      </Link>

      <button
        type="button"
        className={cn(
          "mt-[var(--sp-2)] w-full max-w-[120px] rounded-lg px-4 py-1.5 text-[12px] font-bold transition-colors",
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-95",
        )}
      >
        Takip Et
      </button>
    </article>
  );
}

export const CreatorCard = memo(CreatorCardInner);
