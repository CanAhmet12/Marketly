"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  buildMarketNewsroomBundle,
  fetchMarketNewsById,
  fetchMarketNewsRows,
} from "@/features/markets/fetch-market-news";
import { pickRelatedNews } from "@/features/markets/lib/market-news-editorial";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { getMarketsRepository } from "@/features/markets/repository";
import type { MarketNewsDetailItem } from "@/features/markets/types/news-calendar-intelligence";

/** Canlı detay — 60s polling */
const NEWS_DETAIL_POLL_MS = 60_000;
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useMarketNewsDetail(newsId: string) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const repo = useMemo(() => getMarketsRepository(), []);
  const { watchlist, hydrated } = useMarketsWatchlist(mockOn ? repo.getWatchlistSeed() : undefined);

  const watchedArr = useMemo(
    () => [...watchlist].map((s) => s.trim().toUpperCase()).sort(),
    [watchlist],
  );
  const portfolioSyms = mockOn ? repo.getPortfolioIntelligenceBundle().portfolioSymbols : [];

  const mockBundle = useMemo(() => {
    if (!mockOn || !hydrated) return null;
    return repo.getMarketNewsroomBundle(watchedArr, portfolioSyms);
  }, [repo, mockOn, hydrated, watchedArr, portfolioSyms]);

  const liveQuery = useQuery({
    queryKey: queryKeys.marketNewsDetail(newsId),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      const portfolio = repo.getPortfolioIntelligenceBundle().portfolioSymbols;
      const row = await fetchMarketNewsById(client, newsId);
      if (!row) return { item: null, related: [] as MarketNewsDetailItem[] };
      const bundle = buildMarketNewsroomBundle([row], watchedArr, portfolio);
      const item = bundle.items[0] ?? null;
      const rows = await fetchMarketNewsRows(client, 30);
      const allBundle = buildMarketNewsroomBundle(rows, watchedArr, portfolio);
      const related = item ? pickRelatedNews(item, allBundle.items, 4) : [];
      return { item, related };
    },
    enabled: liveMode && hydrated && Boolean(newsId),
    staleTime: 45_000,
    refetchInterval: NEWS_DETAIL_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const item = mockOn
    ? (mockBundle?.items.find((i) => i.id === newsId) ?? null)
    : (liveQuery.data?.item ?? null);

  const related = mockOn
    ? (item && mockBundle ? pickRelatedNews(item, mockBundle.items, 4) : [])
    : (liveQuery.data?.related ?? []);

  return {
    item: item as MarketNewsDetailItem | null,
    related: related as MarketNewsDetailItem[],
    mockOn,
    liveMode,
    hydrated,
    isLoading: mockOn ? !hydrated : liveQuery.isLoading,
    isRefetching: liveMode && liveQuery.isFetching && !liveQuery.isLoading,
    notFound: mockOn ? hydrated && !item : hydrated && !liveQuery.isLoading && !item,
    isEmpty: liveMode && hydrated && !liveQuery.isLoading && !item,
  };
}
