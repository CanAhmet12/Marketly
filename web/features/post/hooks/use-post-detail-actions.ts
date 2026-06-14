"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, type QueryClient } from "@tanstack/react-query";

import type { AuthUser } from "@/lib/supabase/types";
import { togglePostLike, toggleSavedPost } from "@/features/engagement/post-like-save";
import { getSocialRepository } from "@/features/social/repository";
import type { DiscussionReactionKind, ThesisStance } from "@/features/social/repository/discussion-types";
import { insertPostComment } from "../fetch-post-comments";
import type { PostCommentRow, PostDetail, DiscussionIntent } from "../types";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";

type Params = {
  postId: string;
  post: PostDetail | undefined;
  user: AuthUser | null;
  uid: string | null;
  viewerKey: string;
  loginHref: string;
  qc: QueryClient;
  threadFollowing: boolean;
};

export function usePostDetailActions({
  postId,
  post,
  user,
  uid,
  viewerKey,
  loginHref,
  qc,
  threadFollowing,
}: Params) {
  const router = useRouter();
  const mockOn = isMockDataEnabled();

  const [commentText, setCommentText] = useState("");
  const [commentErr, setCommentErr] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [composerIntent, setComposerIntent] = useState<DiscussionIntent | null>(null);
  const [copyHint, setCopyHint] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const postUrl =
    typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : `/post/${postId}`;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      if (mockOn) {
        qc.setQueryData(queryKeys.postDetail(postId, viewerKey), (old: PostDetail | undefined) => {
          if (!old) return old;
          const was = old.is_liked;
          return { ...old, is_liked: !was, likes: Math.max(0, old.likes + (was ? -1 : 1)) };
        });
        return;
      }
      await togglePostLike(getSupabaseBrowserClient(), user.id, post.id, post.is_liked);
    },
    onSuccess: () => {
      if (mockOn) return;
      void qc.invalidateQueries({ queryKey: queryKeys.postDetail(postId, viewerKey) });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      if (mockOn) {
        qc.setQueryData(queryKeys.postDetail(postId, viewerKey), (old: PostDetail | undefined) =>
          old ? { ...old, is_saved: !old.is_saved } : old,
        );
        return;
      }
      await toggleSavedPost(getSupabaseBrowserClient(), user.id, post.id, post.is_saved);
    },
    onSuccess: () => {
      if (mockOn) return;
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

      if (mockOn) {
        qc.setQueryData(queryKeys.postComments(postId, viewerKey), (old: PostCommentRow[] | undefined) => [
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
      if (mockOn) return;
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
      if (mockOn) {
        qc.setQueryData(queryKeys.postComments(postId, viewerKey), (old: PostCommentRow[] | undefined) =>
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

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!user) {
        router.push(loginHref);
        return;
      }
      action();
    },
    [loginHref, router, user],
  );

  const onLikePost = useCallback(() => {
    if (!post) return;
    requireAuth(() => void likeMutation.mutateAsync());
  }, [likeMutation, post, requireAuth]);

  const onSavePost = useCallback(() => {
    if (!post) return;
    requireAuth(() => void saveMutation.mutateAsync());
  }, [post, requireAuth, saveMutation]);

  const onShare = useCallback(() => {
    if (!post) return;
    setShareOpen(true);
  }, [post]);

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
    requireAuth(() => {
      const next = !threadFollowing;
      getSocialRepository().setFollowingThread(user!.id, postId, next);
      void qc.invalidateQueries({ queryKey: queryKeys.postParticipation(postId, viewerKey) });
    });
  }, [postId, qc, requireAuth, threadFollowing, user, viewerKey]);

  const onReaction = useCallback(
    (kind: DiscussionReactionKind) => {
      requireAuth(() => void discReactionMutation.mutateAsync({ kind }));
    },
    [discReactionMutation, requireAuth],
  );

  const onThesis = useCallback(
    (stance: ThesisStance) => {
      requireAuth(() => void thesisMutation.mutateAsync(stance));
    },
    [requireAuth, thesisMutation],
  );

  const onBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  return {
    commentText,
    setCommentText,
    commentErr,
    replyTo,
    setReplyTo,
    composerIntent,
    setComposerIntent,
    copyHint,
    shareOpen,
    setShareOpen,
    postUrl,
    likeMutation,
    saveMutation,
    sendCommentMutation,
    commentLikeMutation,
    discReactionMutation,
    thesisMutation,
    onLikePost,
    onSavePost,
    onShare,
    onCopyLink,
    onToggleThreadFollow,
    onReaction,
    onThesis,
    onBack,
  };
}
