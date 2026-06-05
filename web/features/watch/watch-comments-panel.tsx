/* eslint-disable @next/next/no-img-element -- avatar */

import Link from "next/link";
import { useState } from "react";

import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { EmptyState, ErrorState } from "@/components/states";
import type { WatchVideoComment } from "@/features/watch/types";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  postId: string;
  user: { id: string; displayName?: string | null; avatarUrl?: string | null } | null;
  commentText: string;
  onCommentTextChange: (v: string) => void;
  commentMsg: string | null;
  commentsQuery: UseQueryResult<WatchVideoComment[], Error>;
  sendCommentMutation: UseMutationResult<void, Error, string, unknown>;
  onSubmitComment: () => void;
};

export function WatchCommentsPanel({
  postId,
  user,
  commentText,
  onCommentTextChange,
  commentMsg,
  commentsQuery,
  sendCommentMutation,
  onSubmitComment,
}: Props) {
  const mockOn = isMockDataEnabled();

  // Optimistic mock comments
  const [mockComments, setMockComments] = useState<WatchVideoComment[]>([]);
  const [mockPending, setMockPending] = useState(false);

  const handleSubmit = () => {
    if (mockOn && user) {
      if (!commentText.trim()) return;
      setMockPending(true);
      const newComment: WatchVideoComment = {
        id: `mock-comment-${Date.now()}`,
        video_id: postId,
        user_id: user.id,
        content: commentText.trim(),
        likes: 0,
        is_pinned: false,
        created_at: new Date().toISOString(),
        author_name: user.displayName ?? "Sen",
        author_avatar: user.avatarUrl ?? null,
        author_handle: "@sen",
      };
      setTimeout(() => {
        setMockComments((prev) => [newComment, ...prev]);
        setMockPending(false);
        onCommentTextChange("");
      }, 400);
      return;
    }
    onSubmitComment();
  };

  const allComments = [
    ...mockComments,
    ...(commentsQuery.data ?? []),
  ];

  const pinnedComments = allComments.filter((c) => c.is_pinned);
  const regularComments = allComments.filter((c) => !c.is_pinned);

  return (
    <section className="mt-5">
      <h2 className="mb-3 text-[14px] font-bold text-[var(--color-text)]">
        Yorumlar
        {allComments.length > 0 ? (
          <span className="ml-2 text-[12px] font-medium text-[var(--color-meta)]">({allComments.length})</span>
        ) : null}
      </h2>

      {/* Composer */}
      {!user ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[13px] text-[var(--color-muted)]">
          Yorum yazmak için{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(`/watch/${postId}`)}`}
            className="font-semibold text-[var(--color-primary-dark)] hover:underline"
          >
            giriş yapın
          </Link>
          .
        </div>
      ) : (
        <div className="flex gap-3">
          <img
            src={user.avatarUrl ?? fallbackAvatar(user.id, user.displayName ?? "?")}
            alt=""
            className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[var(--color-ring-subtle)]"
          />
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => onCommentTextChange(e.target.value)}
              rows={2}
              placeholder="Yorum yaz…"
              disabled={sendCommentMutation.isPending || mockPending}
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-meta)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            {commentMsg ? (
              <p className="mt-1 text-[12px] text-[var(--color-danger)]" role="alert">{commentMsg}</p>
            ) : null}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                disabled={!commentText.trim() || sendCommentMutation.isPending || mockPending}
                className="rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-45"
                onClick={handleSubmit}
              >
                {(sendCommentMutation.isPending || mockPending) ? "Gönderiliyor…" : "Gönder"}
              </button>
              {commentText.trim() && (
                <button
                  type="button"
                  className="text-[12px] text-[var(--color-meta)] hover:text-[var(--color-text)]"
                  onClick={() => onCommentTextChange("")}
                >
                  İptal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="mt-5 space-y-0">
        {commentsQuery.isLoading && mockComments.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="motion-shimmer h-8 w-8 shrink-0 rounded-full bg-[var(--color-divider)]" />
                <div className="flex-1 space-y-1.5">
                  <div className="motion-shimmer h-3 w-32 rounded bg-[var(--color-divider)]" />
                  <div className="motion-shimmer h-4 w-full rounded bg-[var(--color-divider)]" />
                </div>
              </div>
            ))}
          </div>
        ) : commentsQuery.isError ? (
          <ErrorState
            title="Yorumlar yüklenemedi"
            retryLabel="Tekrar dene"
            onRetry={() => void commentsQuery.refetch()}
            compact
          />
        ) : allComments.length === 0 ? (
          <EmptyState title="Henüz yorum yok" description="İlk yorumu sen yaz!" compact />
        ) : (
          <>
            {/* Pinned comments first */}
            {pinnedComments.map((c) => (
              <div key={c.id} className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-3 ring-1 ring-[var(--color-border)]">
                <img
                  src={c.author_avatar?.trim() ? c.author_avatar : fallbackAvatar(c.user_id, c.author_name)}
                  alt=""
                  className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[12px] font-bold text-[var(--color-text)]">{c.author_name}</span>
                    <span className="rounded-full bg-[var(--color-primary-light)] px-1.5 py-px text-[9px] font-bold text-[var(--color-primary-dark)]">Sabitlenmiş</span>
                    <span className="text-[11px] text-[var(--color-meta)]">{formatTimeAgo(c.created_at)}</span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{c.content}</p>
                </div>
              </div>
            ))}
            {/* Regular comments */}
            {regularComments.map((c) => (
              <div key={c.id} className="flex gap-3 border-b border-[var(--color-divider)] py-3 last:border-0">
                <img
                  src={c.author_avatar?.trim() ? c.author_avatar : fallbackAvatar(c.user_id, c.author_name)}
                  alt=""
                  className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[var(--color-ring-subtle)]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[13px] font-semibold text-[var(--color-text)]">{c.author_name}</span>
                    <span className="text-[11px] text-[var(--color-meta)]">{formatTimeAgo(c.created_at)}</span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{c.content}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
