"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { isPulsePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { togglePostLike } from "@/features/engagement/post-like-save";
import { fetchWatchPost } from "@/features/watch/fetch-watch-post";
import { trackWatchProgress } from "@/features/personalization/tracking";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { queryKeys } from "@/lib/query-keys";
import { isMockDataEnabled } from "@/mock/config";
import { mockWatchPostDetail } from "@/mock/adapters/watch";

import { PulseSlide } from "./pulse-slide";
import { PulseCommentsSheet } from "./pulse-comments-sheet";
import { PulsePlayerSkeleton } from "./pulse-player-skeleton";
import { usePulseFeedQueue } from "./use-pulse-feed";

type Props = { postId: string };

function watchDetailToFeedPost(d: NonNullable<Awaited<ReturnType<typeof fetchWatchPost>>>): FeedPost {
  return {
    id: d.id,
    user_id: d.user_id,
    content: d.content,
    asset_tag: d.asset_tag,
    image_url: d.image_url,
    type: d.type,
    video_url: d.video_url,
    thumbnail_url: d.thumbnail_url,
    title: d.title,
    likes: d.likes,
    comments: d.comments,
    views_count: d.views_count,
    created_at: d.created_at,
    author_name: d.author_name,
    author_handle: d.author_handle,
    author_avatar: d.author_avatar,
    author_tier: d.author_tier,
    is_liked: d.is_liked,
    is_saved: d.is_saved,
    media_urls: (d.media_urls as FeedPost["media_urls"]) ?? null,
    mentioned_users: null,
    link_preview: null,
    quoted_post_id: null,
    quoted_post: null,
  };
}

export function PulsePlayerClient({ postId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isInitialized } = useAuth();
  const uid = user?.id ?? null;
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const { posts: queuePosts, isLoading, isError, refetch: refetchQueue } = usePulseFeedQueue(postId);

  const fallbackQuery = useQuery({
    queryKey: queryKeys.watchPost(postId, uid),
    enabled:
      (isMockDataEnabled() || (isInitialized && isSupabaseConfigured())) &&
      Boolean(postId) &&
      queuePosts.length === 0 &&
      !isLoading,
    queryFn: async () => {
      if (isMockDataEnabled()) return mockWatchPostDetail(postId, uid);
      const client = getSupabaseBrowserClient();
      return fetchWatchPost(client, postId, uid);
    },
  });

  const posts = useMemo(() => {
    if (queuePosts.length > 0) return queuePosts;
    const d = fallbackQuery.data;
    if (d && isPulsePost(watchDetailToFeedPost(d))) return [watchDetailToFeedPost(d)];
    if (d) return [watchDetailToFeedPost(d)];
    return [];
  }, [queuePosts, fallbackQuery.data]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const slides = root.querySelectorAll<HTMLElement>("[data-pulse-index]");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.62) {
            const idx = Number((e.target as HTMLElement).dataset.pulseIndex);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.62] },
    );
    slides.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [posts.length]);

  useEffect(() => {
    const p = posts[activeIndex];
    if (!p) return;
    trackWatchProgress({
      creatorId: p.user_id,
      assetSymbol: p.asset_tag?.trim().toUpperCase() || undefined,
      contentFormat: "pulse",
      quality: 0.7,
      surface: "pulse",
    });
  }, [activeIndex, posts]);

  const likeMutation = useMutation({
    mutationFn: async (targetId: string) => {
      if (!user?.id) throw new Error("auth");
      const target = posts.find((p) => p.id === targetId);
      if (!target) return;
      if (isMockDataEnabled()) return;
      const c = getSupabaseBrowserClient();
      await togglePostLike(c, user.id, targetId, target.is_liked);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
      void qc.invalidateQueries({ queryKey: queryKeys.discoverFeed(uid) });
    },
  });

  const onLike = useCallback(
    (id: string) => {
      if (!user?.id) {
        router.push(`/auth/login?next=/pulse/${encodeURIComponent(id)}`);
        return;
      }
      likeMutation.mutate(id);
    },
    [likeMutation, router, user?.id],
  );

  const scrollToIndex = useCallback((index: number) => {
    const root = scrollerRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-pulse-index="${index}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleRetry = useCallback(() => {
    void refetchQueue();
    void fallbackQuery.refetch();
  }, [refetchQueue, fallbackQuery]);

  useEffect(() => {
    if (!mounted || commentsOpen || posts.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back();
        return;
      }
      if (e.key === "ArrowDown" && activeIndex < posts.length - 1) {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      }
      if (e.key === "ArrowUp" && activeIndex > 0) {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, commentsOpen, activeIndex, posts.length, router, scrollToIndex]);

  const loading = isLoading || (posts.length === 0 && fallbackQuery.isPending);

  const renderShell = (content: ReactNode) => {
    if (!mounted) return null;
    return createPortal(content, document.body);
  };

  if (loading) {
    return renderShell(<PulsePlayerSkeleton onBack={() => router.back()} />);
  }

  if (isError && posts.length === 0) {
    return renderShell(
      <div className="pulse-player">
        <div className="pulse-player__top">
          <button type="button" className="pulse-player__back" onClick={() => router.back()} aria-label="Geri">
            ←
          </button>
        </div>
        <EmptyState
          title="Pulse yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          actionLabel="Tekrar dene"
          onAction={handleRetry}
          secondaryActionLabel="Pulse keşfet"
          secondaryActionHref="/pulse"
          compact
        />
      </div>,
    );
  }

  if (!posts.length) {
    return renderShell(
      <div className="pulse-player">
        <div className="pulse-player__top">
          <button type="button" className="pulse-player__back" onClick={() => router.back()} aria-label="Geri">
            ←
          </button>
        </div>
        <EmptyState title="Pulse bulunamadı" description="Bu içerik kaldırılmış veya erişilemiyor olabilir." actionLabel="Pulse keşfet" actionHref="/pulse" compact />
      </div>,
    );
  }

  const activePost = posts[activeIndex];

  return renderShell(
    <div className="pulse-player">
      <header className="pulse-player__top">
        <button type="button" className="pulse-player__back" onClick={() => router.back()} aria-label="Geri">
          ←
        </button>
        <span className="pulse-player__brand">Pulse</span>
        <Link href="/pulse" className="pulse-player__hub-link">
          Keşfet
        </Link>
      </header>

      <div ref={scrollerRef} className="pulse-player__scroller" aria-label="Pulse akışı">
        {posts.map((post, index) => (
          <div key={post.id} className="pulse-player__snap" data-pulse-index={index}>
            <PulseSlide
              post={post}
              active={index === activeIndex}
              isLoggedIn={Boolean(user?.id)}
              onRequireAuth={() => router.push(`/auth/login?next=/pulse/${encodeURIComponent(post.id)}`)}
              onLike={() => onLike(post.id)}
              onOpenComments={() => {
                setActiveIndex(index);
                setCommentsOpen(true);
              }}
            />
          </div>
        ))}
      </div>

      {posts.length > 1 ? (
        <nav className="pulse-player__nav-rail" aria-label="Pulse gezinme">
          <button
            type="button"
            className="pulse-player__nav"
            disabled={activeIndex === 0}
            aria-label="Önceki Pulse"
            onClick={() => scrollToIndex(activeIndex - 1)}
          >
            ↑
          </button>
          <button
            type="button"
            className="pulse-player__nav"
            disabled={activeIndex >= posts.length - 1}
            aria-label="Sonraki Pulse"
            onClick={() => scrollToIndex(activeIndex + 1)}
          >
            ↓
          </button>
        </nav>
      ) : null}

      <PulseCommentsSheet
        postId={commentsOpen ? (activePost?.id ?? postId) : null}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </div>,
  );
}
