"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchMarketNewsroomBundle } from "@/features/markets/fetch-market-news";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { getMarketsRepository } from "@/features/markets/repository";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

/** Canlı liste — 90s polling */
const NEWS_ROOM_POLL_MS = 90_000;

export function useMarketNewsroom() {
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
    queryKey: queryKeys.marketNewsroom(watchedArr.join(",")),
    queryFn: async () => {
      const portfolio = repo.getPortfolioIntelligenceBundle().portfolioSymbols;
      return fetchMarketNewsroomBundle(getSupabaseBrowserClient(), watchedArr, portfolio);
    },
    enabled: liveMode && hydrated,
    staleTime: 60_000,
    refetchInterval: NEWS_ROOM_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const bundle = mockOn ? mockBundle : (liveQuery.data ?? null);

  return {
    bundle,
    mockOn,
    liveMode,
    hydrated,
    isLoading: mockOn ? !hydrated : liveQuery.isLoading,
    isRefetching: liveMode && liveQuery.isFetching && !liveQuery.isLoading,
    isEmpty: !mockOn && hydrated && !liveQuery.isLoading && (bundle?.items.length ?? 0) === 0,
  };
}
