"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedEngagementMutations } from "@/features/engagement/use-feed-engagement-mutations";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";

type FeedEngagementOverlay = Partial<Pick<FeedPost, "is_liked" | "is_saved" | "likes">>;

type Options = {
  loginNext?: string;
};

/** P6-001 / P6-004 — optimistic like & save (home, search, discover feed) */
export function useFeedEngagement({ loginNext = "/" }: Options = {}) {
  const router = useRouter();
  const { toggleLike, toggleSave, user } = useFeedEngagementMutations();
  const [overlays, setOverlays] = useState<Record<string, FeedEngagementOverlay>>({});

  const applyOverlay = useCallback(
    (post: FeedPost): FeedPost => {
      const o = overlays[post.id];
      if (!o) return post;
      return { ...post, ...o };
    },
    [overlays],
  );

  const patchOverlay = useCallback((post: FeedPost, patch: FeedEngagementOverlay) => {
    setOverlays((prev) => ({
      ...prev,
      [post.id]: { ...prev[post.id], ...patch },
    }));
  }, []);

  const revertOverlay = useCallback((postId: string, previous: FeedEngagementOverlay | undefined) => {
    setOverlays((prev) => {
      if (!previous) {
        const next = { ...prev };
        delete next[postId];
        return next;
      }
      return { ...prev, [postId]: previous };
    });
  }, []);

  const handlers: HomeEngagementHandlers = useMemo(
    () => ({
      isLoggedIn: Boolean(user?.id),
      likePendingPostId: toggleLike.isPending ? (toggleLike.variables?.postId ?? null) : null,
      savePendingPostId: toggleSave.isPending ? (toggleSave.variables?.postId ?? null) : null,
      onToggleLike: (post) => {
        if (!user?.id) {
          router.push(`/auth/login?next=${encodeURIComponent(loginNext)}`);
          return;
        }
        const prevOverlay = overlays[post.id];
        const nextLiked = !post.is_liked;
        patchOverlay(post, {
          is_liked: nextLiked,
          likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)),
        });
        toggleLike.mutate(
          { postId: post.id, currentlyLiked: post.is_liked },
          {
            onError: () => revertOverlay(post.id, prevOverlay),
          },
        );
      },
      onToggleSave: (post) => {
        if (!user?.id) {
          router.push(`/auth/login?next=${encodeURIComponent(loginNext)}`);
          return;
        }
        const prevOverlay = overlays[post.id];
        const nextSaved = !post.is_saved;
        patchOverlay(post, { is_saved: nextSaved });
        toggleSave.mutate(
          { postId: post.id, currentlySaved: post.is_saved },
          {
            onError: () => revertOverlay(post.id, prevOverlay),
          },
        );
      },
      onRequireAuth: () => {
        router.push(`/auth/login?next=${encodeURIComponent(loginNext)}`);
      },
    }),
    [user?.id, toggleLike, toggleSave, router, loginNext, overlays, patchOverlay, revertOverlay],
  );

  return { handlers, applyOverlay, toggleLike, toggleSave };
}
