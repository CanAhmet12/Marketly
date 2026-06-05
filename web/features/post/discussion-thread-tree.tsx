"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useState } from "react";

import type { PostCommentRow, DiscussionIntent } from "@/features/post/types";
import type { CommentTreeNode } from "@/features/post/post-detail-helpers";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { formatTimeAgo } from "@/lib/format-time-ago";

type NodesProps = {
  nodes: CommentTreeNode[];
  depth: number;
  postAuthorId: string;
  currentUserId: string | null;
  onReply: (id: string, name: string) => void;
  onToggleCommentLike: (commentId: string, like: boolean) => void;
  likeBusy: boolean;
  loginHref: string;
};

type Props = {
  forest: CommentTreeNode[];
  postAuthorId: string;
  currentUserId: string | null;
  onReply: (id: string, name: string) => void;
  onToggleCommentLike: (commentId: string, like: boolean) => void;
  likeBusy: boolean;
  loginHref: string;
};

function intentLabel(i: DiscussionIntent | null | undefined): string | null {
  if (!i) return null;
  const m: Record<DiscussionIntent, string> = {
    thesis: "Tez",
    question: "Soru",
    data: "Veri",
    risk: "Risk",
  };
  return m[i] ?? null;
}

function stanceChip(stance: PostCommentRow["thesis_stance"]): string | null {
  if (!stance) return null;
  if (stance === "agree") return "Katılıyor";
  if (stance === "disagree") return "Ayrışıyor";
  return "Nötr";
}

function ThreadNodes({
  nodes,
  depth,
  postAuthorId: _postAuthorId,
  currentUserId,
  onReply,
  onToggleCommentLike,
  likeBusy,
  loginHref,
}: NodesProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <ul className={`m-0 list-none space-y-2 p-0 ${depth > 0 ? "mt-2 border-l border-[var(--color-divider)] pl-3" : ""}`}>
      {nodes.map(({ comment: c, children }) => {
        if (c.is_hidden) {
          return (
            <li key={c.id} className="rounded-md border border-dashed border-[var(--color-border)] px-2 py-1.5 text-[11px] text-[var(--color-muted)]">
              Bu tartışma girişi gizlendi veya kaldırıldı.
            </li>
          );
        }
        const hasKids = children.length > 0;
        const isCollapsed = collapsed[c.id] && hasKids;
        const il = intentLabel(c.discussion_intent);
        const st = stanceChip(c.thesis_stance);

        return (
          <li key={c.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 shadow-[var(--shadow-card)] sm:p-3">
            {c.is_pinned ? (
              <span className="mb-1.5 inline-block rounded bg-[var(--color-primary-light)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--color-primary-dark)]">
                Sabitli tartışma
              </span>
            ) : null}
            <div className="flex gap-2.5 sm:gap-3">
              <img
                src={c.author_avatar?.trim() ? c.author_avatar : fallbackAvatar(c.user_id, c.author_name)}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full border border-[var(--color-border)] object-cover sm:h-9 sm:w-9"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-1.5 gap-y-0">
                  <span className="text-[13px] font-semibold text-[var(--color-text)]">{c.author_name}</span>
                  {c.is_creator_reply ? (
                    <span className="rounded bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] px-1 py-px text-[9px] font-bold text-[var(--color-primary-dark)]">
                      Üretici
                    </span>
                  ) : null}
                  <span className="text-[11px] text-[var(--color-muted)]">{c.author_handle}</span>
                  <span className="text-[11px] text-[var(--color-muted)]">· {formatTimeAgo(c.created_at)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {il ? (
                    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-px text-[10px] font-semibold text-[var(--color-text-secondary)]">
                      {il}
                    </span>
                  ) : null}
                  {st ? (
                    <span className="rounded-full border border-[var(--color-border)] px-2 py-px text-[10px] font-semibold text-[var(--color-meta)]">
                      {st}
                    </span>
                  ) : null}
                  {c.market_tags?.length
                    ? c.market_tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[var(--color-primary-light)] px-2 py-px text-[10px] font-semibold text-[var(--color-primary-dark)]"
                        >
                          #{t}
                        </span>
                      ))
                    : null}
                  {c.signal_ref ? (
                    <span className="rounded-full border border-[var(--color-border)] px-2 py-px text-[10px] font-medium text-[var(--color-text-secondary)]">
                      {c.signal_ref}
                    </span>
                  ) : null}
                </div>
                {c.quoted_snippet ? (
                  <p className="mt-1.5 border-l-2 border-[var(--color-primary)]/45 pl-2 text-[11px] italic leading-snug text-[var(--color-text-secondary)]">
                    “{c.quoted_snippet}”
                  </p>
                ) : null}
                <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-snug text-[var(--color-text)]">{c.content}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    disabled={!currentUserId || likeBusy}
                    onClick={() => {
                      if (!currentUserId) {
                        window.location.href = loginHref;
                        return;
                      }
                      onToggleCommentLike(c.id, !c.is_liked);
                    }}
                    className={c.is_liked ? "font-semibold text-[var(--color-danger)]" : "text-[var(--color-muted)]"}
                  >
                    ♥ {c.likes}
                  </button>
                  {currentUserId ? (
                    <button type="button" className="text-[var(--color-muted)] hover:text-[var(--color-text)]" onClick={() => onReply(c.id, c.author_name)}>
                      Yanıtla
                    </button>
                  ) : (
                    <Link href={loginHref} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                      Yanıtla
                    </Link>
                  )}
                  {hasKids ? (
                    <button type="button" className="text-[var(--color-primary-dark)] hover:underline" onClick={() => toggle(c.id)}>
                      {isCollapsed ? `Dalları aç (${children.length})` : "Dalları daralt"}
                    </button>
                  ) : null}
                </div>
                {hasKids && !isCollapsed ? (
                  <ThreadNodes
                    nodes={children}
                    depth={depth + 1}
                    postAuthorId={_postAuthorId}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onToggleCommentLike={onToggleCommentLike}
                    likeBusy={likeBusy}
                    loginHref={loginHref}
                  />
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function PostDiscussionThreadTree({ forest, ...rest }: Props) {
  return <ThreadNodes nodes={forest} depth={0} {...rest} />;
}
