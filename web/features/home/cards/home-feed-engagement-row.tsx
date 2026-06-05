"use client";

import Link from "next/link";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

async function sharePost(post: FeedPost) {
  const snippet = post.content?.trim()
    ? `${post.content.slice(0, 140)}${post.content.length > 140 ? "…" : ""}`
    : post.title || "Marketly gönderisi";
  const text = `${post.author_name}: ${snippet}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "Marketly", text });
      return;
    } catch {
      /* iptal */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* yok */
  }
}

type Props = {
  post: FeedPost;
  commentHref: string;
  engagement: HomeEngagementHandlers;
  /** Home timeline — daha geniş dokunuş, sakin ikonlar. Keşfet sinyal şeridi — `compact`. */
  variant?: "default" | "home" | "compact";
};

const iconClass = "shrink-0 opacity-90";

export function HomeFeedEngagementRow({ post, commentHref, engagement, variant = "default" }: Props) {
  const home = variant === "home";
  const compact = variant === "compact";
  const likePending = engagement.likePendingPostId === post.id;
  const savePending = engagement.savePendingPostId === post.id;
  const gap = compact ? "gap-2" : home ? "gap-1.5 sm:gap-2" : "gap-x-[var(--sp-4)] gap-y-1.5";
  const btn = compact
    ? "group/btn inline-flex min-h-7 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold tabular-nums transition-colors"
    : home
      ? "inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold tabular-nums transition-[background-color,color,transform] duration-200 active:scale-[0.97] sm:min-h-9 sm:min-w-0 sm:px-3"
      : "group/btn flex items-center gap-1.5 text-[13px] font-semibold transition-colors";

  const iconSz = home ? 18 : compact ? 14 : 16;

  return (
    <div
      className={cn(
        "ms-home-native-actions flex flex-wrap items-center",
        home ? "justify-between gap-y-1" : "",
        !home && !compact && "mt-3",
        gap,
      )}
    >
      <div className={cn("flex flex-wrap items-center", home ? "gap-1 sm:gap-1.5" : compact ? "gap-1" : "")}>
        <button
          type="button"
          className={cn(
            btn,
            likePending && "engagement-pending",
            post.is_liked
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-meta)] hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]",
          )}
        onClick={(e) => {
          e.preventDefault();
          if (!engagement.isLoggedIn) engagement.onRequireAuth?.();
          else engagement.onToggleLike(post);
        }}
        aria-label={post.is_liked ? "Beğeniyi kaldır" : "Beğen"}
        aria-busy={likePending}
        disabled={likePending}
      >
        <svg className={iconClass} width={iconSz} height={iconSz} viewBox="0 0 24 24" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span
          className={cn(
            home && "min-w-[1.75rem] text-left text-[13px] text-[var(--color-text-secondary)]",
            compact && "min-w-[1.5rem] text-left text-[11px] text-[var(--color-text-secondary)]",
          )}
        >
          {formatCompactCount(post.likes)}
        </span>
      </button>
      <Link
        href={commentHref}
        className={cn(
          btn,
          "text-[var(--color-meta)] hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]",
        )}
        aria-label="Yorumlar"
      >
        <svg className={iconClass} width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span
          className={cn(
            home && "min-w-[1.75rem] text-left text-[13px] text-[var(--color-text-secondary)]",
            compact && "min-w-[1.5rem] text-left text-[11px] text-[var(--color-text-secondary)]",
          )}
        >
          {formatCompactCount(post.comments)}
        </span>
      </Link>
      <button
        type="button"
        className={cn(
          btn,
          savePending && "engagement-pending",
          post.is_saved ? "text-[var(--color-primary)]" : "text-[var(--color-meta)] hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]",
        )}
        onClick={(e) => {
          e.preventDefault();
          if (!engagement.isLoggedIn) engagement.onRequireAuth?.();
          else engagement.onToggleSave(post);
        }}
        aria-label={post.is_saved ? "Kaydı kaldır" : "Kaydet"}
        aria-busy={savePending}
        disabled={savePending}
      >
        <svg className={iconClass} width={iconSz} height={iconSz} viewBox="0 0 24 24" fill={post.is_saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      </div>
      {home ? (
        <button
          type="button"
          className={cn(
            btn,
            "text-[var(--color-meta)] hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]",
          )}
          onClick={() => void sharePost(post)}
          aria-label="Paylaş"
        >
          <svg className={iconClass} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3v12M8 7l4-4 4 4M5 14h14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
