"use client";

/**
 * PostDetailClient — premium dark editorial layout
 */

import Link from "next/link";

import { PostDetailSkeleton } from "./post-detail-skeleton";
import { resolvePostDetailMedia, resolvePostDetailShellHint } from "./post-detail-helpers";
import { usePostDetailActions } from "./hooks/use-post-detail-actions";
import { usePostDetailData } from "./hooks/use-post-detail-data";

import { PostDetailMediaHero } from "./components/post-detail-media-hero";
import { PostDetailContentBody, PostDetailContentLead } from "./components/post-detail-content";
import { PostDetailEngagement } from "./components/post-detail-engagement";
import { PostDetailDiscussion } from "./components/post-detail-discussion";
import { PostDetailShareSheet } from "./components/post-detail-share-sheet";
import { PostDetailSidebar } from "./components/post-detail-sidebar";
import {
  PostDetailTypeBanner,
  postDetailShellCanvasClass,
} from "./components/post-detail-type-banner";

type Props = { postId: string };

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PostDetailClient({ postId }: Props) {
  const data = usePostDetailData(postId);
  const actions = usePostDetailActions({
    postId,
    post: data.post,
    user: data.user,
    uid: data.uid,
    viewerKey: data.viewerKey,
    loginHref: data.loginHref,
    qc: data.qc,
    threadFollowing: data.threadFollowing,
  });

  if (data.needsConfig) {
    return (
      <div className="pd-canvas ms-page-wrapper--no-top">
        <div className="pd-shell">
          <div className="pd-error-block">
            <div className="pd-error-title">Bağlantı gerekli</div>
            <div className="pd-error-desc">{data.configError ?? "Supabase yapılandırması eksik."}</div>
          </div>
        </div>
      </div>
    );
  }

  if (data.isLoading) {
    return (
      <div className="pd-canvas ms-page-wrapper--no-top">
        <div className="pd-shell">
          <PostDetailSkeleton />
        </div>
      </div>
    );
  }

  if (data.isNotFound || !data.post) {
    return (
      <div className="pd-canvas ms-page-wrapper--no-top">
        <div className="pd-shell">
          <div className="pd-error-block">
            <div className="pd-error-title">Gönderi bulunamadı</div>
            <div className="pd-error-desc">Silinmiş veya erişiminiz olmayan bir içerik olabilir.</div>
            <Link href="/" className="pd-error-link">
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const post = data.post;
  const media = resolvePostDetailMedia(post);
  const shellHint = resolvePostDetailShellHint(post);
  const canvasClass = `pd-canvas ms-page-wrapper--no-top${postDetailShellCanvasClass(shellHint)}`;

  return (
    <div className={canvasClass}>
      <div className="pd-shell">
        <header className="pd-topbar">
          <div className="pd-topbar-start">
            <button type="button" onClick={actions.onBack} className="pd-back-btn" aria-label="Geri">
              <BackIcon />
              Geri
            </button>
            <Link href="/" className="pd-feed-link">
              Ana akış
            </Link>
          </div>
          <div className="pd-topbar-actions">
            {actions.copyHint && <span className="pd-copy-toast">Bağlantı kopyalandı</span>}
            <button
              type="button"
              onClick={() => void actions.onCopyLink()}
              className="pd-topbar-icon-btn"
              aria-label="Bağlantıyı kopyala"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
            <button type="button" onClick={actions.onShare} className="pd-topbar-icon-btn" aria-label="Paylaş">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <span className="pd-topbar-label">{shellHint?.topbarLabel ?? "Gönderi"}</span>
          </div>
        </header>

        {shellHint ? <PostDetailTypeBanner postId={postId} hint={shellHint} /> : null}

        <div className="pd-page">
          <div className="pd-main-col">
            <div className="pd-prose">
              <PostDetailContentLead post={post} onShare={actions.onShare} />
            </div>

            {media ? <PostDetailMediaHero post={post} /> : null}

            <div className={`pd-prose${media ? " pd-prose--tight-top" : ""}`}>
              <PostDetailContentBody post={post} />
              <PostDetailEngagement
                post={post}
                isLiked={post.is_liked}
                isSaved={post.is_saved}
                onLike={actions.onLikePost}
                onSave={actions.onSavePost}
                onShare={actions.onShare}
                likePending={actions.likeMutation.isPending}
                savePending={actions.saveMutation.isPending}
                user={data.user}
              />
            </div>

            <hr className="pd-section-divider" />

            <PostDetailDiscussion
              postId={postId}
              postAuthorId={post.user_id}
              currentUserId={data.uid}
              user={data.user}
              forest={data.forest}
              commentsLoading={data.commentsQuery.isLoading}
              commentsError={data.commentsQuery.isError}
              refetchComments={() => void data.commentsQuery.refetch()}
              commentText={actions.commentText}
              setCommentText={actions.setCommentText}
              replyTo={actions.replyTo}
              setReplyTo={actions.setReplyTo}
              sendingComment={actions.sendCommentMutation.isPending}
              commentError={actions.commentErr}
              onSendComment={() => void actions.sendCommentMutation.mutateAsync()}
              onToggleCommentLike={(commentId, like) =>
                void actions.commentLikeMutation.mutateAsync({ commentId, like })
              }
              likeBusy={actions.commentLikeMutation.isPending}
              loginHref={data.loginHref}
              threadFollowing={data.threadFollowing}
              onToggleThreadFollow={actions.onToggleThreadFollow}
              reactions={data.reactionsQuery.data ?? null}
              onReaction={actions.onReaction}
              reactionBusy={actions.discReactionMutation.isPending}
              thesisStance={data.thesisStance}
              onThesis={actions.onThesis}
              thesisBusy={actions.thesisMutation.isPending}
              composerIntent={actions.composerIntent}
              setComposerIntent={actions.setComposerIntent}
            />
          </div>

          <PostDetailSidebar post={post} postId={postId} viewerId={data.uid} />
        </div>
      </div>

      <PostDetailShareSheet
        open={actions.shareOpen}
        onClose={() => actions.setShareOpen(false)}
        post={post}
        url={actions.postUrl}
      />
    </div>
  );
}
