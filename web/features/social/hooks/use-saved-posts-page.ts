"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/features/auth/use-auth";
import type { FeedPost } from "@/features/feed/types";
import { fetchSavedPosts } from "@/features/social/fetch-saved-posts";
import { persistSavedPostToggle, readSavedPostIds } from "@/features/social/lib/saved-posts-storage";
import { mapMockPostToFeedPost } from "@/mock/adapters/feed";
import { resolveMockPostSourceById } from "@/mock/adapters/mock-post-resolve";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function readMockSavedPosts(userId: string | null): FeedPost[] {
  return [...readSavedPostIds()]
    .map((id) => {
      const src = resolveMockPostSourceById(id);
      if (!src) return null;
      return mapMockPostToFeedPost(src, null, userId);
    })
    .filter((p): p is FeedPost => p !== null)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function useSavedPostsPage() {
  const { user, isInitialized } = useAuth();
  const mockOn = isMockDataEnabled();
  const qc = useQueryClient();
  const [mockPosts, setMockPosts] = useState<FeedPost[]>([]);
  const [mockReady, setMockReady] = useState(false);

  const reloadMock = useCallback(() => {
    setMockPosts(readMockSavedPosts(user?.id ?? null));
  }, [user?.id]);

  useEffect(() => {
    if (!mockOn) return;
    queueMicrotask(() => {
      reloadMock();
      setMockReady(true);
    });
  }, [mockOn, reloadMock]);

  const liveQuery = useQuery({
    queryKey: queryKeys.savedPosts(user?.id ?? null),
    enabled: !mockOn && isInitialized && Boolean(user?.id) && isSupabaseConfigured(),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      return fetchSavedPosts(client, user!.id);
    },
  });

  const posts = mockOn ? mockPosts : (liveQuery.data ?? []);
  const ready = mockOn ? mockReady : isInitialized && (liveQuery.isSuccess || liveQuery.isError || !user);
  const loading = mockOn ? !mockReady : liveQuery.isLoading;

  const unsave = useCallback(
    async (postId: string) => {
      if (!user?.id) return;
      if (mockOn) {
        persistSavedPostToggle(postId, true);
        reloadMock();
        return;
      }
      const { toggleSavedPost } = await import("@/features/engagement/post-like-save");
      const client = getSupabaseBrowserClient();
      await toggleSavedPost(client, user.id, postId, true);
      void qc.invalidateQueries({ queryKey: queryKeys.savedPosts(user.id) });
    },
    [user?.id, mockOn, reloadMock, qc],
  );

  const error = useMemo(() => {
    if (mockOn || !liveQuery.error) return null;
    return liveQuery.error instanceof Error ? liveQuery.error.message : "Kayıtlar yüklenemedi";
  }, [mockOn, liveQuery.error]);

  return { posts, ready, loading, error, unsave, refetch: liveQuery.refetch };
}
