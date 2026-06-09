"use client";

/**
 * useDiscoverViewModel — Discover feed view model
 *
 * Sprint 2 — Bölüm 2: TikTok iki-aşamalı pipeline bağlantısı
 *
 * Araştırma:
 *  • TikTok Re-ranking (Stage 3): exploration pool injection, diversity, safety
 *  • Instagram: "balanced mix of content types" — format çeşitliliği
 *  • Netflix: incrementality — kullanıcının zaten bulabileceğini değil,
 *    bulAMAyacağını önererek keşif alanını genişlet
 *
 * Değişiklikler:
 *  - useDiscoverFeed artık tab parametresi kabul ediyor
 *  - useDiscoverViewModel tab'ı useDiscoverFeed'e iletiyor
 *  - rawPosts değil, RANKED posts buildDiscoverViewModel'a gidiyor
 */

import { useMemo } from "react";

import { useDiscoverFeed } from "@/features/feed/use-discover-feed";
import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";
import { buildDiscoverViewModel, type DiscoverViewModel } from "@/features/discover/visual-reference/discover-view-model-adapter";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

/**
 * @param tab - Aktif sekme; sıralama ağırlıklarını ve çeşitlilik penceresini ayarlar.
 *   TikTok yaklaşımı: her sekmenin kendi explorationGamma değeri var
 *   (pulse: 0.62, live: 0.58, trending: 0.52, videos: 0.48)
 */
export function useDiscoverViewModel(tab: DiscoverTabId = "trending") {
  // Aşama 1+2: Ham post'lar alınır + TAB'A GÖRE sıralanır
  const { posts, query } = useDiscoverFeed(tab);

  const feedEnabled = isMockDataEnabled() || isSupabaseConfigured();
  const mockOn = isMockDataEnabled();

  // View model: ranked posts → VM adapter
  // Stage 3 Re-ranking (çeşitlilik) zaten useDiscoverFeed içinde uygulanıyor
  const viewModel = useMemo(() => {
    const postsForVm = query.isError ? [] : posts;
    return buildDiscoverViewModel(postsForVm, mockOn);
  }, [query.isError, posts, mockOn]);

  return {
    viewModel,
    feedLoading: Boolean(feedEnabled && query.isLoading),
    feedError: Boolean(feedEnabled && query.isError),
    feedEnabled,
    refetchFeed: () => void query.refetch(),
    feedHasNextPage: Boolean(query.hasNextPage),
    feedIsFetchingNextPage: query.isFetchingNextPage,
    loadMoreFeed: () => void query.fetchNextPage(),
    // Rank meta — debug/A-B test için
    rankedPostCount: posts.length,
  };
}

export type { DiscoverViewModel };
