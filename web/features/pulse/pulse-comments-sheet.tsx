"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "@/features/auth/use-auth";
import { fetchVideoComments, insertVideoComment } from "@/features/watch/fetch-video-comments";
import type { WatchVideoComment } from "@/features/watch/types";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isMockDataEnabled } from "@/mock/config";
import { mockVideoCommentsFor } from "@/mock/fixtures/comments";

type Props = {
  postId: string | null;
  open: boolean;
  onClose: () => void;
};

export function PulseCommentsSheet({ postId, open, onClose }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mockComments, setMockComments] = useState<WatchVideoComment[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const mockOn = isMockDataEnabled();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) setText("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const commentsQuery = useQuery({
    queryKey: queryKeys.watchComments(postId ?? ""),
    enabled: open && Boolean(postId) && !mockOn,
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      return fetchVideoComments(client, postId!);
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!postId || !user?.id) throw new Error("auth");
      if (mockOn) {
        const row: WatchVideoComment = {
          id: `mock-pulse-c-${Date.now()}`,
          video_id: postId,
          user_id: user.id,
          content: content.trim(),
          likes: 0,
          is_pinned: false,
          created_at: new Date().toISOString(),
          author_name: user.displayName ?? "Sen",
          author_avatar: user.avatarUrl ?? null,
          author_handle: "@sen",
        };
        setMockComments((prev) => [row, ...prev]);
        return;
      }
      const client = getSupabaseBrowserClient();
      const res = await insertVideoComment(client, postId, user.id, content);
      if (!res.ok) throw new Error(res.error ?? "Yorum gönderilemedi");
    },
    onSuccess: () => {
      setText("");
      if (!mockOn && postId) {
        void qc.invalidateQueries({ queryKey: queryKeys.watchComments(postId) });
        void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
      }
    },
  });

  const allComments = mockOn && postId
    ? [...mockComments, ...mockVideoCommentsFor(postId)]
    : (commentsQuery.data ?? []);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [open, postId]);

  if (!mounted || !open || !postId) return null;

  const loginNext = `/pulse/${encodeURIComponent(postId)}`;

  return createPortal(
    <div className="pulse-comments-sheet" role="dialog" aria-modal aria-label="Yorumlar">
      <button type="button" className="pulse-comments-sheet__backdrop" onClick={onClose} aria-label="Kapat" />
      <div className="pulse-comments-sheet__panel">
        <div className="pulse-comments-sheet__handle" aria-hidden />
        <header className="pulse-comments-sheet__head">
          <h2 className="pulse-comments-sheet__title">
            Yorumlar
            {allComments.length > 0 ? <span className="pulse-comments-sheet__count">{allComments.length}</span> : null}
          </h2>
          <button type="button" className="pulse-comments-sheet__close" onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </header>

        <div ref={listRef} className="pulse-comments-sheet__list">
          {commentsQuery.isPending && !mockOn ? (
            <p className="pulse-comments-sheet__empty">Yükleniyor…</p>
          ) : allComments.length === 0 ? (
            <p className="pulse-comments-sheet__empty">İlk yorumu sen yaz.</p>
          ) : (
            allComments.map((c) => (
              <article key={c.id} className="pulse-comments-sheet__row">
                <img
                  src={c.author_avatar ?? fallbackAvatar(c.user_id, c.author_name)}
                  alt=""
                  className="pulse-comments-sheet__avatar"
                />
                <div className="pulse-comments-sheet__body">
                  <div className="pulse-comments-sheet__meta">
                    <span className="pulse-comments-sheet__author">{c.author_name}</span>
                    <span className="pulse-comments-sheet__time">{formatTimeAgo(c.created_at)}</span>
                  </div>
                  <p className="pulse-comments-sheet__text">{c.content}</p>
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="pulse-comments-sheet__composer">
          {!user ? (
            <p className="pulse-comments-sheet__login">
              Yorum yazmak için{" "}
              <Link href={`/auth/login?next=${encodeURIComponent(loginNext)}`} className="pulse-comments-sheet__login-link">
                giriş yap
              </Link>
            </p>
          ) : (
            <form
              className="pulse-comments-sheet__form"
              onSubmit={(e) => {
                e.preventDefault();
                const t = text.trim();
                if (!t || sendMutation.isPending) return;
                void sendMutation.mutateAsync(t);
              }}
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Yorum ekle…"
                className="pulse-comments-sheet__input"
                maxLength={500}
              />
              <button type="submit" className="pulse-comments-sheet__send" disabled={!text.trim() || sendMutation.isPending}>
                Gönder
              </button>
            </form>
          )}
          {sendMutation.isError ? (
            <p className="pulse-comments-sheet__error">{sendMutation.error.message}</p>
          ) : null}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
