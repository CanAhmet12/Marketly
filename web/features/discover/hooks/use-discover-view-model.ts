"use client";

import { useMemo } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { useDiscoverFeed } from "@/features/feed/use-discover-feed";
import { buildDiscoverViewModel, type DiscoverViewModel } from "@/features/discover/visual-reference/discover-view-model-adapter";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useDiscoverViewModel() {
  const { isInitialized } = useAuth();
  const { posts, query } = useDiscoverFeed();

  const feedEnabled = isMockDataEnabled() || (isInitialized && isSupabaseConfigured());

  const mockOn = isMockDataEnabled();
  const viewModel = useMemo(() => {
    const postsForVm = query.isError ? [] : posts;
    // MC-001/MC-002: mock=false iken VR fallback devre dışı
    return buildDiscoverViewModel(postsForVm, mockOn);
  }, [query.isError, posts, mockOn]);

  return {
    viewModel,
    feedLoading: Boolean(feedEnabled && query.isPending && !query.data),
    feedError: Boolean(feedEnabled && query.isError),
    feedEnabled,
    refetchFeed: () => void query.refetch(),
    feedHasNextPage: Boolean(query.hasNextPage),
    feedIsFetchingNextPage: query.isFetchingNextPage,
    loadMoreFeed: () => void query.fetchNextPage(),
  };
}

export type { DiscoverViewModel };
