"use client";

import { useRouter } from "next/navigation";
import type { UseMutationResult } from "@tanstack/react-query";

import { LiveMarketTicker } from "@/features/live/live-market-ticker";
import { shareWatchPost } from "@/features/watch/watch-helpers";
import type { WatchPostDetail } from "@/features/watch/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";

type Props = {
  post: WatchPostDetail;
  streamTitle: string;
  viewerCount: number;
  userId: string | null;
  loginNext: string;
  likeMutation: UseMutationResult<unknown, Error, void, unknown>;
  saveMutation: UseMutationResult<unknown, Error, void, unknown>;
  onOpenChat: () => void;
};

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" />
    </svg>
  );
}

function IconBookmark({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinejoin="round" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5a8.5 8.5 0 1 1 17 0z" strokeLinejoin="round" />
    </svg>
  );
}

export function LiveWatchDock({
  post,
  streamTitle,
  viewerCount,
  userId,
  loginNext,
  likeMutation,
  saveMutation,
  onOpenChat,
}: Props) {
  const router = useRouter();

  const requireAuth = (fn: () => void) => {
    if (!userId) {
      router.push(`/auth/login?next=${encodeURIComponent(loginNext)}`);
      return;
    }
    fn();
  };

  return (
    <div className="live-watch__dock">
      {post.asset_tag ? <LiveMarketTicker symbol={post.asset_tag} /> : null}

      <h1 className="live-watch__dock-title">{streamTitle}</h1>

      <p className="live-watch__dock-sub">
        {formatCompactCount(viewerCount)} izleyici · {formatCompactCount(post.views_count)} görüntülenme ·{" "}
        {formatTimeAgo(post.created_at)}
      </p>

      <div className="live-watch__dock-actions">
        <button
          type="button"
          className="live-watch__dock-btn"
          data-active={post.is_liked ? "true" : undefined}
          disabled={likeMutation.isPending}
          aria-label={post.is_liked ? "Beğeniyi geri al" : "Beğen"}
          aria-pressed={post.is_liked}
          onClick={() => requireAuth(() => void likeMutation.mutateAsync())}
        >
          <IconHeart filled={post.is_liked} />
          <span>{formatCompactCount(post.likes)}</span>
        </button>

        <button
          type="button"
          className="live-watch__dock-btn"
          data-saved={post.is_saved ? "true" : undefined}
          disabled={saveMutation.isPending}
          aria-label={post.is_saved ? "Kaydı kaldır" : "Kaydet"}
          aria-pressed={post.is_saved}
          onClick={() => requireAuth(() => void saveMutation.mutateAsync())}
        >
          <IconBookmark filled={post.is_saved} />
          <span>{post.is_saved ? "Kaydedildi" : "Kaydet"}</span>
        </button>

        <button type="button" className="live-watch__dock-btn" aria-label="Paylaş" onClick={() => void shareWatchPost(post)}>
          <IconShare />
          <span>Paylaş</span>
        </button>

        <button type="button" className="live-watch__dock-btn" aria-label="Sohbeti aç" onClick={onOpenChat}>
          <IconChat />
          <span>Sohbet</span>
        </button>
      </div>
    </div>
  );
}
