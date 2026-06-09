"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { type HomeFeedFetchMode } from "@/features/feed/fetch-home-feed";
import { dedupeFeedPostsById } from "@/features/feed/dedupe-feed-posts";
import { getHomeRepository } from "@/features/home/repository";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { ASYNC_CONFIG } from "@/lib/async/async-config";
import { withTimeout } from "@/lib/async/with-timeout";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useHomeFeed(mode: HomeFeedFetchMode) {
  const mounted = useClientMounted();
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const feedEnabled = mounted && (isMockDataEnabled() || isSupabaseConfigured());

  const query = useInfiniteQuery({
    queryKey: queryKeys.homeFeed(uid ?? "anon", mode),
    enabled: feedEnabled,
    initialPageParam: 0,
    networkMode: "always",
    refetchOnMount: "always",
    staleTime: 30_000,
    retry: 1,
    queryFn: async ({ pageParam }) =>
      withTimeout(
        getHomeRepository().getHomeFeed(uid, mode, pageParam as number),
        ASYNC_CONFIG.network.timeout,
        "home-feed-timeout",
      ),
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length : undefined),
  });

  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!feedEnabled || isMockDataEnabled() || !isSupabaseConfigured()) return;

    const client = getSupabaseBrowserClient();
    const channel = client
      .channel("web_home_posts_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => {
          if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
          realtimeTimerRef.current = setTimeout(() => {
            void query.refetch();
          }, 500);
        },
      )
      .subscribe();

    return () => {
      if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
      void client.removeChannel(channel);
    };
  }, [feedEnabled, query.refetch]);

  const posts = dedupeFeedPostsById(query.data?.pages.flatMap((p) => p.posts) ?? []);

  return { posts, query, feedEnabled };
}
