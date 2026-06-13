"use client";

/**
 * useDiscoverFeed — Discover feed verisi + TikTok iki-aşamalı sıralama
 *
 * Araştırma kaynakları (Sprint 2 — Bölüm 2):
 *  • TikTok Monolith pipeline: Candidate Generation → Ranking → Re-ranking
 *    (buildwithaws.substack.com — "rank during current video, serve on swipe")
 *  • Instagram Two-Tower: 500 aday → hafif model → ağır model final skor
 *    (meta.com/transparency/ai-system-cards)
 *  • TikTok Stage 3 Re-ranking: çeşitlilik + güvenlik + exploration pool
 *
 * Marketly uyarlaması (2 aşama):
 *  Aşama 1 — Aday Üretimi: Supabase'den ham post'lar (mevcut useInfiniteQuery)
 *  Aşama 2 — Sıralama: computeDiscoverFeedRanking (tab-duyarlı + affinity)
 *             → diversityReorderDiscover (pencere tabanlı çeşitlilik)
 *
 * NOT: Önceki implementasyon bu fonksiyonu HIÇ çağırmıyordu.
 *      Tam implement edilmiş motor artık bağlandı.
 */

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { dedupeFeedPostsById } from "@/features/feed/dedupe-feed-posts";
import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";
import { getHomeRepository } from "@/features/home/repository";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPersonalizationRepository } from "@/features/personalization/repository";

/**
 * Ham (sıralanmamış) discover feed — sayfalanmış
 */
export function useDiscoverFeedRaw() {
  const mounted = useClientMounted();
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const feedEnabled = mounted && (isMockDataEnabled() || isSupabaseConfigured());

  const query = useInfiniteQuery({
    queryKey: queryKeys.discoverFeed(uid),
    enabled: feedEnabled,
    initialPageParam: 0,
    networkMode: "always",
    refetchOnMount: "always",
    staleTime: 30_000,
    retry: 1,
    queryFn: async ({ pageParam }) => getHomeRepository().getDiscoverFeedPage(uid, pageParam as number),
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length : undefined),
  });

  const rawPosts = dedupeFeedPostsById(query.data?.pages.flatMap((p) => p.posts) ?? []);

  return { rawPosts, query, uid };
}

/**
 * TikTok iki-aşamalı pipeline uyarlaması:
 *  Aşama 1 (Aday üretimi): rawPosts = DB'den gelen ham post'lar
 *  Aşama 2 (Sıralama):     computeDiscoverFeedRanking → sekme + affinity + diversity
 *
 * @param tab - Aktif discover sekmesi (sıralama ağırlıklarını değiştirir)
 */
export function useDiscoverFeed(tab: DiscoverTabId = "trending") {
  const { rawPosts, query, uid } = useDiscoverFeedRaw();

  // Aşama 2 — Ranking (TikTok yaklaşımı: önceki video oynarken sıralanır)
  // Araştırma: "rank during current video, serve on swipe"
  const posts = useMemo(() => {
    if (rawPosts.length === 0) return rawPosts;

    // getPersonalizationRepository().rankDiscoverFeed çağrısı:
    //  - computeDiscoverFeedRanking (tab-aware scoring + novelty gamma)
    //  - diversityReorderDiscover (pencere tabanlı creator/asset/format çeşitliliği)
    // NOT: mock repo da aynı fonksiyonu çağırır → tutarlı davranış
    try {
      return getPersonalizationRepository().rankDiscoverFeed(rawPosts, tab, uid);
    } catch {
      // Sıralama başarısız → ham liste (graceful degradation)
      return rawPosts;
    }
  }, [rawPosts, tab, uid]);

  return { posts, query };
}
