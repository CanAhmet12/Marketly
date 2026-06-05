"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { EmptyState, ErrorState } from "@/components/states";
import { avatarUrl } from "@/lib/avatar-url";
import type { DiscussionReactionKind, ThesisStance } from "@/features/social/repository/discussion-types";
import { PostDiscussionThreadTree } from "../discussion-thread-tree";
import type { CommentTreeNode } from "../post-detail-helpers";
import type { DiscussionIntent } from "../types";

interface Props {
  postId: string;
  postAuthorId: string;
  currentUserId: string | null;
  user: { id: string; displayName?: string | null; email?: string | null; avatarUrl?: string | null } | null;
  forest: CommentTreeNode[];
  commentsLoading: boolean;
  commentsError: boolean;
  refetchComments: () => void;
  commentText: string;
  setCommentText: (text: string) => void;
  replyTo: { id: string; name: string } | null;
  setReplyTo: (replyTo: { id: string; name: string } | null) => void;
  sendingComment: boolean;
  commentError: string | null;
  onSendComment: () => void;
  onToggleCommentLike: (commentId: string, like: boolean) => void;
  likeBusy: boolean;
  loginHref: string;
  threadFollowing: boolean;
  onToggleThreadFollow: () => void;
  threadFollowBusy?: boolean;
  reactions: Record<DiscussionReactionKind, number> | null;
  onReaction: (kind: DiscussionReactionKind) => void;
  reactionBusy?: boolean;
  thesisStance: ThesisStance | null;
  onThesis: (stance: ThesisStance) => void;
  thesisBusy?: boolean;
  composerIntent: DiscussionIntent | null;
  setComposerIntent: (intent: DiscussionIntent | null) => void;
}

export function PostDetailDiscussion({
  postAuthorId,
  currentUserId,
  user,
  forest,
  commentsLoading,
  commentsError,
  refetchComments,
  commentText,
  setCommentText,
  replyTo,
  setReplyTo,
  sendingComment,
  commentError,
  onSendComment,
  onToggleCommentLike,
  likeBusy,
  loginHref,
  threadFollowing,
  onToggleThreadFollow,
  threadFollowBusy,
  reactions,
  onReaction,
  reactionBusy,
  thesisStance,
  onThesis,
  thesisBusy,
  composerIntent,
  setComposerIntent,
}: Props) {
  const userAvatar = user
    ? user.avatarUrl || avatarUrl(user.id, user.displayName || user.email || "U")
    : null;

  return (
    <section id="yorumlar" className="pd-prose pd-discussion-wrap">
      <h2 className="pd-section-title">Tartışma</h2>

      <div className="pd-composer">
        <div className="pd-composer-tools">
          <div className="pd-composer-tools-row">
            <button
              type="button"
              disabled={!user || threadFollowBusy}
              onClick={onToggleThreadFollow}
              className={`pd-thread-follow-btn${threadFollowing ? " pd-thread-follow-btn--active" : ""}`}
            >
              {threadFollowing ? "Tartışmayı bırak" : "Tartışmayı takip et"}
            </button>

            {reactions && (
              <div className="pd-reaction-group">
                {(
                  [
                    { k: "insightful" as const, label: "İçgörü" },
                    { k: "thanks" as const, label: "Teşekkür" },
                    { k: "debate" as const, label: "Tartış" },
                  ] as const
                ).map(({ k, label }) => (
                  <button
                    key={k}
                    type="button"
                    disabled={!user || reactionBusy}
                    onClick={() => onReaction(k)}
                    className="pd-reaction-btn"
                  >
                    {label} {reactions[k]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user && (
            <div className="pd-composer-tools-row">
              <span className="pd-stance-label">Tez durumu</span>
              {(["agree", "disagree", "neutral"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={thesisBusy}
                  onClick={() => onThesis(s)}
                  className={`pd-stance-btn${
                    thesisStance === s
                      ? s === "agree"
                        ? " pd-stance-btn--agree"
                        : s === "disagree"
                          ? " pd-stance-btn--disagree"
                          : " pd-stance-btn--neutral"
                      : ""
                  }`}
                >
                  {s === "agree" ? "Katılıyorum" : s === "disagree" ? "Ayrışıyorum" : "Nötr"}
                </button>
              ))}
            </div>
          )}

          {user && (
            <div className="pd-composer-tools-row">
              {(
                [
                  { id: "thesis" as const, label: "Tez" },
                  { id: "question" as const, label: "Soru" },
                  { id: "data" as const, label: "Veri" },
                  { id: "risk" as const, label: "Risk" },
                ] as const
              ).map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setComposerIntent(composerIntent === x.id ? null : x.id)}
                  className={`pd-intent-btn${composerIntent === x.id ? " pd-intent-btn--active" : ""}`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {replyTo && (
          <div className="pd-reply-banner">
            <span>
              Yanıt: <strong>{replyTo.name}</strong>
            </span>
            <button type="button" onClick={() => setReplyTo(null)} className="pd-cancel-reply">
              İptal
            </button>
          </div>
        )}

        {!user ? (
          <p className="pd-login-hint">
            Yorum yazmak için{" "}
            <Link href={loginHref}>giriş yapın</Link>.
          </p>
        ) : (
          <div className="pd-composer-row">
            {userAvatar && (
              <SafeAvatar src={userAvatar} alt="Avatar" size={36} className="pd-composer-avatar" />
            )}
            <div className="pd-composer-body">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder={replyTo ? `${replyTo.name} kullanıcısına yanıt…` : "Görüşünüzü paylaşın…"}
                className="pd-textarea"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    if (!sendingComment && commentText.trim()) onSendComment();
                  }
                }}
              />
              {commentError && <div className="pd-comment-err">{commentError}</div>}
              <div className="pd-composer-actions">
                <button
                  type="button"
                  onClick={onSendComment}
                  disabled={sendingComment || !commentText.trim()}
                  className="pd-submit-btn"
                >
                  {sendingComment ? "Gönderiliyor…" : "Gönder"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {commentsLoading ? (
        <p className="pd-login-hint" style={{ textAlign: "center", padding: "0.5rem 0" }}>
          Yorumlar yükleniyor…
        </p>
      ) : commentsError ? (
        <ErrorState
          title="Yorumlar yüklenemedi"
          description="Yorumlar şu anda yüklenemiyor."
          retryLabel="Tekrar dene"
          onRetry={refetchComments}
          compact
        />
      ) : forest.length === 0 ? (
        <EmptyState
          title="Henüz yorum yok"
          description="İlk yorumu siz yazın."
          tone="social"
          compact
        />
      ) : (
        <PostDiscussionThreadTree
          forest={forest}
          postAuthorId={postAuthorId}
          currentUserId={currentUserId}
          onReply={(id, name) => setReplyTo({ id, name })}
          onToggleCommentLike={onToggleCommentLike}
          likeBusy={likeBusy}
          loginHref={loginHref}
        />
      )}
    </section>
  );
}
