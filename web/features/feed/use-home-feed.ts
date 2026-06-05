"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { type HomeFeedFetchMode } from "@/features/feed/fetch-home-feed";
import { dedupeFeedPostsById } from "@/features/feed/dedupe-feed-posts";
import { getHomeRepository } from "@/features/home/repository";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useHomeFeed(mode: HomeFeedFetchMode) {
  const { user, isInitialized } = useAuth();
  const uid = user?.id ?? null;

  const query = useInfiniteQuery({
    queryKey: queryKeys.homeFeed(uid, mode),
    enabled: isMockDataEnabled() || (isInitialized && isSupabaseConfigured()),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => getHomeRepository().getHomeFeed(uid, mode, pageParam as number),
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length : undefined),
  });

  const posts = dedupeFeedPostsById(query.data?.pages.flatMap((p) => p.posts) ?? []);

  return { posts, query };
}
