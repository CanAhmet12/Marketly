"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AlertCallout } from "@/components/shared/alert-callout";
import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { liveHrefForPostId } from "@/features/live/live-href";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";
import { togglePostLike, toggleSavedPost } from "@/features/engagement/post-like-save";
import { getStudioRepository } from "@/features/studio/repository";
import { fetchRelatedVideos } from "@/features/watch/fetch-related-videos";
import { fetchVideoComments, insertVideoComment } from "@/features/watch/fetch-video-comments";
import { fetchWatchPost } from "@/features/watch/fetch-watch-post";
import { mockRelatedVideos, mockWatchPostDetail } from "@/mock/adapters/watch";
import { mockVideoCommentsFor } from "@/mock/fixtures/comments";
import { isMockDataEnabled } from "@/mock/config";
import { WatchCommentsPanel } from "@/features/watch/watch-comments-panel";
import { isVideoishPost, posterUrl, resolveVideoUrl } from "@/features/watch/watch-helpers";
import { WatchMainColumn } from "@/features/watch/watch-main-column";
import { WatchPageSkeleton } from "@/features/watch/watch-page-skeleton";
import { WatchRelatedSidebar } from "@/features/watch/watch-related-sidebar";
import { trackWatchProgress } from "@/features/personalization/tracking";
import { AdaptiveRecommendationHints } from "@/features/personalization/components/adaptive-recommendation-hints";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { trackVideoViewImpulse } from "@/lib/analytics/web-events";
import { queryKeys } from "@/lib/query-keys";
import type { WatchPostDetail } from "@/features/watch/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Props = {
  postId: string;
  playlistId?: string | null;
};

export function WatchPageClient({ postId, playlistId = null }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isInitialized, configError } = useAuth();
  const uid = user?.id ?? null;
  const snap = usePersonalizationSnapshot();

  const [commentText, setCommentText] = useState("");
  const [commentMsg, setCommentMsg] = useState<string | null>(null);
  const commentsRef = useRef<HTMLDivElement | null>(null);

  const scrollToComments = useCallback(() => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const postQuery = useQuery({
    queryKey: queryKeys.watchPost(postId, uid),
    enabled: (isMockDataEnabled() || (isInitialized && isSupabaseConfigured())) && Boolean(postId),
    queryFn: async () => {
      if (isMockDataEnabled()) {
        return mockWatchPostDetail(postId, uid);
      }
      const client = getSupabaseBrowserClient();
      return fetchWatchPost(client, postId, uid);
    },
  });

  const post = postQuery.data;

  useEffect(() => {
    if (!post) return;
    const t = (post.type ?? "").toLowerCase();
    if (t === "pulse" || t === "short") {
      router.replace(pulseHrefForPostId(postId));
      return;
    }
    if (t === "live") {
      router.replace(liveHrefForPostId(postId));
    }
  }, [post, postId, router]);

  const playlistMeta = useMemo(() => {
    if (!playlistId) return null;
    return getStudioRepository().getPlaylistById(playlistId);
  }, [playlistId]);

  const relatedQuery = useQuery({
    queryKey: [...queryKeys.watchRelated(postId, post?.user_id ?? "", playlistId, post?.asset_tag ?? "", post?.type ?? ""), snap.watchRev, snap.adaptiveRev] as const,
    enabled: Boolean(post),
    queryFn: async () => {
      if (!post) return [];
      const opts = {
        playlistId: playlistId ?? null,
        currentAssetTag: post.asset_tag,
        currentType: post.type,
        viewerId: uid,
      };
      if (isMockDataEnabled()) {
        return mockRelatedVideos(postId, post.user_id, opts);
      }
      const client = getSupabaseBrowserClient();
      return fetchRelatedVideos(client, postId, post.user_id, opts);
    },
  });

  const commentsQuery = useQuery({
    queryKey: queryKeys.watchComments(postId),
    enabled: Boolean(post),
    queryFn: async () => {
      if (isMockDataEnabled()) {
        return mockVideoCommentsFor(postId);
      }
      const client = getSupabaseBrowserClient();
      return fetchVideoComments(client, postId);
    },
  });

  const trackedViewRef = useRef<string | null>(null);
  const trackedPersonalizationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!post) return;
    getPersonalizationRepository().recordWatchSurfaceFocus({
      viewerId: uid,
      postId: post.id,
      creatorId: post.user_id,
      assetTag: post.asset_tag,
      contentFormat: post.type,
    });
  }, [post, uid]);

  useEffect(() => {
    if (!post || !isSupabaseConfigured() || isMockDataEnabled()) return;
    if (!isVideoishPost(post)) return;
    if (trackedViewRef.current === postId) return;
    trackedViewRef.current = postId;
    void (async () => {
      const c = getSupabaseBrowserClient();
      await trackVideoViewImpulse(c, postId);
    })();
  }, [postId, post]);

  useEffect(() => {
    if (!post || !isVideoishPost(post)) return;
    if (trackedPersonalizationRef.current === postId) return;
    trackedPersonalizationRef.current = postId;
    const t = (post.type ?? "").toLowerCase();
    const contentFormat: "video" | "live" | "pulse" =
      t === "live" ? "live" : t === "pulse" || t === "short" ? "pulse" : "video";
    trackWatchProgress({
      creatorId: post.user_id,
      assetSymbol: post.asset_tag?.trim().toUpperCase() || undefined,
      contentFormat,
      quality: 0.62,
      surface: "watch",
    });
  }, [post, postId]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      if (isMockDataEnabled()) {
        qc.setQueryData<WatchPostDetail>(queryKeys.watchPost(postId, uid), (old) => {
          if (!old) return old;
          const was = old.is_liked;
          return {
            ...old,
            is_liked: !was,
            likes: Math.max(0, old.likes + (was ? -1 : 1)),
          };
        });
        return;
      }
      const c = getSupabaseBrowserClient();
      await togglePostLike(c, user.id, post.id, post.is_liked);
    },
    onSuccess: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.watchPost(postId, uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !post) throw new Error("auth");
      if (isMockDataEnabled()) {
        qc.setQueryData<WatchPostDetail>(queryKeys.watchPost(postId, uid), (old) => (old ? { ...old, is_saved: !old.is_saved } : old));
        return;
      }
      const c = getSupabaseBrowserClient();
      await toggleSavedPost(c, user.id, post.id, post.is_saved);
    },
    onSuccess: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.watchPost(postId, uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
    },
  });

  const sendCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user?.id) throw new Error("auth");
      const c = getSupabaseBrowserClient();
      const res = await insertVideoComment(c, postId, user.id, text);
      if (!res.ok) throw new Error(res.error ?? "Yorum gönderilemedi");
    },
    onSuccess: () => {
      setCommentText("");
      setCommentMsg(null);
      void qc.invalidateQueries({ queryKey: queryKeys.watchComments(postId) });
      void qc.invalidateQueries({ queryKey: queryKeys.watchPost(postId, uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
    },
    onError: (e: Error) => {
      setCommentMsg(e.message);
    },
  });

  const watchSelfPath = useMemo(() => {
    const base = `/watch/${encodeURIComponent(postId)}`;
    return playlistId ? `${base}?list=${encodeURIComponent(playlistId)}` : base;
  }, [postId, playlistId]);

  const onLike = useCallback(() => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(watchSelfPath)}`);
      return;
    }
    void likeMutation.mutateAsync();
  }, [user, likeMutation, router, watchSelfPath]);

  const onSave = useCallback(() => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(watchSelfPath)}`);
      return;
    }
    void saveMutation.mutateAsync();
  }, [user, saveMutation, router, watchSelfPath]);

  const videoSrc = useMemo(() => (post ? resolveVideoUrl(post) : null), [post]);
  const poster = useMemo(() => (post ? posterUrl(post) : null), [post]);
  const isLiveType = post?.type === "live";

  if ((!isInitialized && !isMockDataEnabled()) || (postQuery.isPending && !postQuery.data)) {
    return <WatchPageSkeleton />;
  }

  if ((configError || !isSupabaseConfigured()) && !isMockDataEnabled()) {
    return (
      <AlertCallout tone="warning">{configError ?? "Supabase yapılandırması eksik."}</AlertCallout>
    );
  }

  if (postQuery.isError) {
    return (
      <AlertCallout
        tone="danger"
        title="İçerik yüklenemedi"
        primaryAction={{ label: "Tekrar dene", onClick: () => void postQuery.refetch() }}
      >
        {postQuery.error instanceof Error ? postQuery.error.message : "Hata"}
      </AlertCallout>
    );
  }

  if (!post) {
    return (
      <EmptyState
        title="Video bulunamadı"
        description="Bu bağlantı geçersiz veya içerik kaldırılmış olabilir."
        actionLabel="Ana akışa dön"
        actionHref="/"
        compact
      />
    );
  }

  return (
    <div className="ms-page-wrapper ms-container-full min-w-0 max-w-full overflow-x-hidden">
      {playlistMeta ? (
        <div className="mb-3 min-w-0 rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] px-[var(--sp-3)] py-2 text-[12px] font-medium text-[var(--color-text-secondary)]">
          <span className="text-[var(--color-meta)]">Liste · </span>
          <Link href={`/playlist/${encodeURIComponent(playlistMeta.id)}`} className="font-bold text-[var(--color-primary-dark)] hover:underline">
            {playlistMeta.title}
          </Link>
          <span className="text-[var(--color-meta)]"> · sıradaki öneriler bu listeye göre önceliklendirilir</span>
        </div>
      ) : null}
      <AdaptiveRecommendationHints viewerId={uid} className="mb-3" />
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <WatchMainColumn
            post={post}
            videoSrc={videoSrc}
            poster={poster}
            isLiveType={isLiveType}
            onLike={onLike}
            onSave={onSave}
            likeMutation={likeMutation}
            saveMutation={saveMutation}
            onScrollToComments={scrollToComments}
          />
          <div ref={commentsRef}>
            <WatchCommentsPanel
            postId={postId}
            user={user}
            commentText={commentText}
            onCommentTextChange={setCommentText}
            commentMsg={commentMsg}
            commentsQuery={commentsQuery}
            sendCommentMutation={sendCommentMutation}
            onSubmitComment={() => void sendCommentMutation.mutateAsync(commentText)}
          />
          </div>
        </div>
        <WatchRelatedSidebar
          related={relatedQuery.data ?? []}
          isLoading={relatedQuery.isLoading}
          playlistId={playlistId}
          assetTag={post.asset_tag}
        />
      </div>
    </div>
  );
}
