"use client";

import Link from "next/link";
import { useCallback } from "react";

import type { PostDetail } from "../types";

interface Props {
  post: PostDetail;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  likePending: boolean;
  savePending: boolean;
  user: { id: string } | null;
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#f87171" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function PostDetailEngagement({
  post,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onShare,
  likePending,
  savePending,
  user,
}: Props) {
  const scrollToDiscussion = useCallback(() => {
    document.getElementById("yorumlar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const uploadQuoteNext = `/upload?quotePost=${encodeURIComponent(post.id)}&intent=quote_repost`;
  const loginQuoteHref = `/auth/login?next=${encodeURIComponent(uploadQuoteNext)}`;

  return (
    <div className="pd-engagement">
      <div className="pd-stats">
        <span className="pd-stat">
          <strong>{post.likes.toLocaleString("tr-TR")}</strong> beğeni
        </span>
        <span className="pd-sep">·</span>
        <span className="pd-stat">
          <strong>{post.comments.toLocaleString("tr-TR")}</strong> yorum
        </span>
        {(post.views_count ?? 0) > 0 && (
          <>
            <span className="pd-sep">·</span>
            <span className="pd-stat">
              <strong>{post.views_count?.toLocaleString("tr-TR")}</strong> görüntüleme
            </span>
          </>
        )}
      </div>

      <div className="pd-actions">
        <button
          type="button"
          onClick={onLike}
          disabled={likePending}
          className={`pd-action-btn${isLiked ? " pd-action-btn--liked" : ""}`}
          aria-label={isLiked ? "Beğeniyi kaldır" : "Beğen"}
        >
          <HeartIcon filled={isLiked} />
          Beğen
        </button>

        <button type="button" onClick={scrollToDiscussion} className="pd-action-btn">
          <ChatIcon />
          Yorum
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={savePending}
          className={`pd-action-btn${isSaved ? " pd-action-btn--saved" : ""}`}
          aria-label={isSaved ? "Kaydedilenlerden çıkar" : "Kaydet"}
        >
          <BookmarkIcon filled={isSaved} />
          Kaydet
        </button>

        <button type="button" onClick={onShare} className="pd-action-btn">
          <ShareIcon />
          Paylaş
        </button>

        <Link href={user ? uploadQuoteNext : loginQuoteHref} className="pd-action-btn pd-action-btn--accent">
          <QuoteIcon />
          Alıntı
        </Link>
      </div>
    </div>
  );
}
