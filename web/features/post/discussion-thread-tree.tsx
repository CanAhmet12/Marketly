"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useState } from "react";

import type { PostCommentRow, DiscussionIntent } from "@/features/post/types";
import type { CommentTreeNode } from "@/features/post/post-detail-helpers";
import { postDetailTierLabel } from "@/features/post/post-detail-labels";
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
    <ul className={`pd-comment-list${depth > 0 ? " pd-comment-list--nested" : ""}`}>
      {nodes.map(({ comment: c, children }) => {
        if (c.is_hidden) {
          return (
            <li key={c.id} className="pd-comment pd-comment--hidden">
              Bu tartışma girişi gizlendi veya kaldırıldı.
            </li>
          );
        }
        const hasKids = children.length > 0;
        const isCollapsed = collapsed[c.id] && hasKids;
        const il = intentLabel(c.discussion_intent);
        const st = stanceChip(c.thesis_stance);
        const tierLabel = postDetailTierLabel(c.author_tier);
        const tierKey = c.author_tier.toLowerCase();

        return (
          <li key={c.id} className="pd-comment">
            {c.is_pinned ? <span className="pd-comment-pin">Sabitli</span> : null}
            <div className="pd-comment-row">
              <img
                src={c.author_avatar?.trim() ? c.author_avatar : fallbackAvatar(c.user_id, c.author_name)}
                alt=""
                className="pd-comment-avatar"
              />
              <div className="pd-comment-body">
                <div className="pd-comment-meta">
                  <span className="pd-comment-author">{c.author_name}</span>
                  {c.is_creator_reply ? <span className="pd-comment-badge pd-comment-badge--creator">Üretici</span> : null}
                  {tierLabel && tierKey === "elite" ? (
                    <span className="pd-comment-badge pd-comment-badge--elite">{tierLabel}</span>
                  ) : null}
                  {tierLabel && tierKey === "pro" ? (
                    <span className="pd-comment-badge pd-comment-badge--pro">{tierLabel}</span>
                  ) : null}
                  <span className="pd-comment-handle">{c.author_handle}</span>
                  <span className="pd-comment-time">· {formatTimeAgo(c.created_at)}</span>
                </div>

                {(il || st || c.market_tags?.length || c.signal_ref) ? (
                  <div className="pd-comment-tags">
                    {il ? <span className="pd-comment-tag">{il}</span> : null}
                    {st ? <span className="pd-comment-tag pd-comment-tag--stance">{st}</span> : null}
                    {c.market_tags?.map((t) => (
                      <span key={t} className="pd-comment-tag pd-comment-tag--market">
                        #{t}
                      </span>
                    ))}
                    {c.signal_ref ? <span className="pd-comment-tag">{c.signal_ref}</span> : null}
                  </div>
                ) : null}

                {c.quoted_snippet ? (
                  <p className="pd-comment-quote">"{c.quoted_snippet}"</p>
                ) : null}

                <p className="pd-comment-text">{c.content}</p>

                <div className="pd-comment-actions">
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
                    className={`pd-comment-action${c.is_liked ? " pd-comment-action--liked" : ""}`}
                  >
                    ♥ {c.likes}
                  </button>
                  {currentUserId ? (
                    <button type="button" className="pd-comment-action" onClick={() => onReply(c.id, c.author_name)}>
                      Yanıtla
                    </button>
                  ) : (
                    <Link href={loginHref} className="pd-comment-action">
                      Yanıtla
                    </Link>
                  )}
                  {hasKids ? (
                    <button type="button" className="pd-comment-action pd-comment-action--branch" onClick={() => toggle(c.id)}>
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
