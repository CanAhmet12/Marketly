"use client";

/**
 * PostDetailClient — premium dark editorial layout
 */

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { togglePostLike, toggleSavedPost } from "@/features/engagement/post-like-save";
import { getSocialRepository } from "@/features/social/repository";
import type { DiscussionReactionKind, ThesisStance } from "@/features/social/repository/discussion-types";
import { fetchPostComments, insertPostComment } from "./fetch-post-comments";
import { fetchPostDetail } from "./fetch-post-detail";
import { PostDetailSkeleton } from "./post-detail-skeleton";
import { buildCommentForest, EMPTY_COMMENTS, resolvePostDetailMedia, sharePostDetail } from "./post-detail-helpers";
import { usePostDetailRealtime } from "./use-post-detail-realtime";
import { mockPostDetail } from "@/mock/adapters/post";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";

import { PostDetailMediaHero } from "./components/post-detail-media-hero";
import { PostDetailContent } from "./components/post-detail-content";
import { PostDetailEngagement } from "./components/post-detail-engagement";
import { PostDetailDiscussion } from "./components/post-detail-discussion";
import { PostDetailSidebar } from "./components/post-detail-sidebar";
import type { DiscussionIntent } from "./types";

type Props = { postId: string };

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PostDetailClient({ postId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isInitialized, configError } = useAuth();
  const uid = user?.id ?? null;
  const viewerKey = uid ?? "anon";

  const [commentText, setCommentText] = useState("");
  const [commentErr, setCommentErr] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [composerIntent, setComposerIntent] = useState<DiscussionIntent | null>(null);
  const [copyHint, setCopyHint] = useState(false);

  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : `/post/${postId}`;
  const loginHref = `/auth/login?next=${encodeURIComponent(`/post/${postId}`)}`;

  const postQuery = useQuery({
    queryKey: queryKeys.postDetail(postId, viewerKey),
    enabled: (isMockDataEnabled() || (isInitialized && isSupabaseConfigured())) && Boolean(postId),
    queryFn: async () => {
      if (isMockDataEnabled()) return mockPostDetail(postId, uid);
      return fetchPostDetail(getSupabaseBrowserClient(), postId, uid);
    },
  });

  const post = postQuery.data;

  const commentsQuery = useQuery({
    queryKey: queryKeys.postComments(postId, viewerKey),
    enabled: Boolean(post) && (isMockDataEnabled() || isSupabaseConfigured()),
    queryFn: async () => {
      if (isMockDataEnabled()) return [];
      return fetchPostComments(getSupabaseBrowserClient(), postId, uid);
    },
  });

  const comments = useMemo(() => commentsQuery.data ?? EMPTY_COMMENTS, [commentsQuery.data]);
  const forest = useMemo(() => buildCommentForest(comments), [comments]);

  const reactionsQuery = useQuery({
    queryKey: queryKeys.postDiscussionReactions(postId, viewerKey),
    enabled: Boolean(post),
    queryFn: () => getSocialRepository().getPostDiscussionReactions(postId),
  });

  const participationQuery = useQuery({
    queryKey: queryKeys.postParticipation(postId, viewerKey),
    enabled: Boolean(post),
    queryFn: async () => ({
      following: uid ? getSocialRepository().isFollowingThread(uid, postId) : false,
      thesis: uid ? getSocialRepository().getDiscussionThesisStance(uid, postId) : null,
    }),
  });

  const threadFollowing = participationQuery.data?.following ?? false;
  const thesisStance = participationQuery.data?.thesis ?? null;

  usePostDetailRealtime({
    postId,
    viewerKey,
    post,
    enabled: Boolean(post) && isSupabaseConfigured() && !isMockDataEnabled(),
    qc,
    onRealtimeChannelIssue: () => {},
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      if (isMockDataEnabled()) {
        qc.setQueryData(queryKeys.postDetail(postId, viewerKey), (old: typeof post) => {
          if (!old) return old;
          const was = old.is_liked;
          return { ...old, is_liked: !was, likes: Math.max(0, old.likes + (was ? -1 : 1)) };
        });
        return;
      }
      await togglePostLike(getSupabaseBrowserClient(), user.id, post.id, post.is_liked);
    },
    onSuccess: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.postDetail(postId, viewerKey) });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      if (isMockDataEnabled()) {
        qc.setQueryData(queryKeys.postDetail(postId, viewerKey), (old: typeof post) =>
          old ? { ...old, is_saved: !old.is_saved } : old,
        );
        return;
      }
      await toggleSavedPost(getSupabaseBrowserClient(), user.id, post.id, post.is_saved);
    },
    onSuccess: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.postDetail(postId, viewerKey) });
    },
  });

  const sendCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      const prefix =
        composerIntent === "thesis"
          ? "[Tez] "
          : composerIntent === "question"
            ? "[Soru] "
            : composerIntent === "data"
              ? "[Veri] "
              : composerIntent === "risk"
                ? "[Risk] "
                : "";
      const text = `${prefix}${commentText.trim()}`;
      if (!text.trim()) throw new Error("empty");
      const parentId = replyTo?.id ?? null;

      if (isMockDataEnabled()) {
        qc.setQueryData(queryKeys.postComments(postId, viewerKey), (old: typeof comments) => [
          ...(old ?? []),
          {
            id: `mock-${Date.now()}`,
            post_id: postId,
            user_id: user.id,
            content: text,
            created_at: new Date().toISOString(),
            likes: 0,
            parent_comment_id: parentId,
            depth: 0,
            is_pinned: false,
            author_name: user.displayName ?? user.email ?? "Sen",
            author_handle: "@sen",
            author_avatar: user.avatarUrl ?? null,
            author_tier: "free",
            is_liked: false,
            quoted_snippet: null,
            is_creator_reply: user.id === post.user_id,
            signal_ref: null,
            market_tags: [],
            discussion_intent: composerIntent,
            thesis_stance: null,
            is_hidden: false,
          },
        ]);
        return;
      }

      const res = await insertPostComment(getSupabaseBrowserClient(), {
        postId,
        userId: user.id,
        content: text,
        parentCommentId: parentId,
      });
      if (!res.ok) throw new Error(res.error ?? "Yorum gönderilemedi");
    },
    onSuccess: () => {
      setCommentText("");
      setReplyTo(null);
      setComposerIntent(null);
      setCommentErr(null);
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.postComments(postId, viewerKey) });
      void qc.invalidateQueries({ queryKey: queryKeys.postDetail(postId, viewerKey) });
    },
    onError: (e: Error) => {
      setCommentErr(e.message === "auth" ? "Giriş yapın." : friendlyPostgrestMessage(e));
    },
  });

  const commentLikeMutation = useMutation({
    mutationFn: async ({ commentId, like }: { commentId: string; like: boolean }) => {
      if (!user?.id) throw new Error("auth");
      if (isMockDataEnabled()) {
        qc.setQueryData(queryKeys.postComments(postId, viewerKey), (old: typeof comments) =>
          (old ?? []).map((row) => {
            if (row.id !== commentId) return row;
            const was = row.is_liked;
            let nextLikes = row.likes;
            if (like && !was) nextLikes += 1;
            if (!like && was) nextLikes = Math.max(0, nextLikes - 1);
            return { ...row, is_liked: like, likes: nextLikes };
          }),
        );
        return;
      }

      const c = getSupabaseBrowserClient();
      if (like) {
        const { error } = await c.from("comment_likes").upsert(
          { user_id: user.id, comment_id: commentId },
          { onConflict: "user_id,comment_id" },
        );
        if (error) throw error;
      } else {
        const { error } = await c
          .from("comment_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId);
        if (error) throw error;
      }
    },
    onError: (e: unknown) => setCommentErr(friendlyPostgrestMessage(e as Parameters<typeof friendlyPostgrestMessage>[0])),
  });

  const discReactionMutation = useMutation({
    mutationFn: async ({ kind }: { kind: DiscussionReactionKind }) => {
      if (!user?.id) throw new Error("auth");
      return getSocialRepository().toggleDiscussionReaction(user.id, postId, kind);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.postDiscussionReactions(postId, viewerKey) });
    },
  });

  const thesisMutation = useMutation({
    mutationFn: async (stance: ThesisStance) => {
      if (!user?.id) throw new Error("auth");
      getSocialRepository().setDiscussionThesisStance(user.id, postId, stance);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.postParticipation(postId, viewerKey) });
    },
  });

  const onLikePost = useCallback(() => {
    if (!post) return;
    if (!user) {
      router.push(loginHref);
      return;
    }
    void likeMutation.mutateAsync();
  }, [likeMutation, loginHref, post, router, user]);

  const onSavePost = useCallback(() => {
    if (!post) return;
    if (!user) {
      router.push(loginHref);
      return;
    }
    void saveMutation.mutateAsync();
  }, [loginHref, post, router, saveMutation, user]);

  const onShare = useCallback(() => {
    if (!post) return;
    void sharePostDetail(post, postUrl);
  }, [post, postUrl]);

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopyHint(true);
      window.setTimeout(() => setCopyHint(false), 2200);
    } catch {
      /* yok */
    }
  }, [postUrl]);

  const onToggleThreadFollow = useCallback(() => {
    if (!user) {
      router.push(loginHref);
      return;
    }
    const next = !threadFollowing;
    getSocialRepository().setFollowingThread(user.id, postId, next);
    void qc.invalidateQueries({ queryKey: queryKeys.postParticipation(postId, viewerKey) });
  }, [loginHref, postId, qc, router, threadFollowing, user, viewerKey]);

  const onReaction = useCallback(
    (kind: DiscussionReactionKind) => {
      if (!user) {
        router.push(loginHref);
        return;
      }
      void discReactionMutation.mutateAsync({ kind });
    },
    [discReactionMutation, loginHref, router, user],
  );

  const onThesis = useCallback(
    (stance: ThesisStance) => {
      if (!user) {
        router.push(loginHref);
        return;
      }
      void thesisMutation.mutateAsync(stance);
    },
    [loginHref, router, thesisMutation, user],
  );

  const onBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  if ((configError || !isSupabaseConfigured()) && !isMockDataEnabled()) {
    return (
      <div className="pd-canvas ms-page-wrapper--no-top">
        <div className="pd-shell">
          <div className="pd-error-block">
            <div className="pd-error-title">Bağlantı gerekli</div>
            <div className="pd-error-desc">{configError ?? "Supabase yapılandırması eksik."}</div>
          </div>
        </div>
      </div>
    );
  }

  if ((!isInitialized && !isMockDataEnabled()) || (postQuery.isPending && !postQuery.data)) {
    return (
      <div className="pd-canvas ms-page-wrapper--no-top">
        <div className="pd-shell">
          <PostDetailSkeleton />
        </div>
      </div>
    );
  }

  if (postQuery.isError || !post) {
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

  const media = resolvePostDetailMedia(post);

  return (
    <div className="pd-canvas ms-page-wrapper--no-top">
      <div className="pd-shell">
        <header className="pd-topbar">
          <button type="button" onClick={onBack} className="pd-back-btn" aria-label="Geri">
            <BackIcon />
            Geri
          </button>
          <div className="pd-topbar-actions">
            {copyHint && <span className="pd-copy-toast">Bağlantı kopyalandı</span>}
            <button type="button" onClick={() => void onCopyLink()} className="pd-topbar-icon-btn" aria-label="Bağlantıyı kopyala">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
            <button type="button" onClick={onShare} className="pd-topbar-icon-btn" aria-label="Paylaş">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <span className="pd-topbar-label">Gönderi</span>
          </div>
        </header>

        <div className="pd-page">
          <div className="pd-main-col">
            <div className="pd-prose">
              <PostDetailContent post={post} />
            </div>

            {media && <PostDetailMediaHero post={post} />}

            <div className="pd-prose">
              <PostDetailEngagement
                post={post}
                isLiked={post.is_liked}
                isSaved={post.is_saved}
                onLike={onLikePost}
                onSave={onSavePost}
                onShare={onShare}
                likePending={likeMutation.isPending}
                savePending={saveMutation.isPending}
                user={user}
              />
            </div>

            <hr className="pd-section-divider" />

            <PostDetailDiscussion
              postId={postId}
              postAuthorId={post.user_id}
              currentUserId={uid}
              user={user}
              forest={forest}
              commentsLoading={commentsQuery.isLoading}
              commentsError={commentsQuery.isError}
              refetchComments={() => void commentsQuery.refetch()}
              commentText={commentText}
              setCommentText={setCommentText}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              sendingComment={sendCommentMutation.isPending}
              commentError={commentErr}
              onSendComment={() => void sendCommentMutation.mutateAsync()}
              onToggleCommentLike={(commentId, like) =>
                void commentLikeMutation.mutateAsync({ commentId, like })
              }
              likeBusy={commentLikeMutation.isPending}
              loginHref={loginHref}
              threadFollowing={threadFollowing}
              onToggleThreadFollow={onToggleThreadFollow}
              reactions={reactionsQuery.data ?? null}
              onReaction={onReaction}
              reactionBusy={discReactionMutation.isPending}
              thesisStance={thesisStance}
              onThesis={onThesis}
              thesisBusy={thesisMutation.isPending}
              composerIntent={composerIntent}
              setComposerIntent={setComposerIntent}
            />
          </div>

          <PostDetailSidebar post={post} postId={postId} viewerId={uid} />
        </div>
      </div>
    </div>
  );
}
