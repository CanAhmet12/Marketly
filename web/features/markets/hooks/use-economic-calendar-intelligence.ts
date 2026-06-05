"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchEconomicCalendarBundle } from "@/features/markets/fetch-economic-calendar";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { getMarketsRepository } from "@/features/markets/repository";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useEconomicCalendarIntelligence() {
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
    return repo.getEconomicCalendarIntelligenceBundle(watchedArr, portfolioSyms);
  }, [repo, mockOn, hydrated, watchedArr, portfolioSyms]);

  const liveQuery = useQuery({
    queryKey: queryKeys.economicCalendar(watchedArr.join(",")),
    queryFn: async () => {
      const portfolio = repo.getPortfolioIntelligenceBundle().portfolioSymbols;
      return fetchEconomicCalendarBundle(getSupabaseBrowserClient(), watchedArr, portfolio);
    },
    enabled: liveMode && hydrated,
    staleTime: 120_000,
  });

  const bundle = mockOn ? mockBundle : (liveQuery.data ?? null);

  return {
    bundle,
    mockOn,
    liveMode,
    hydrated,
    isLoading: mockOn ? !hydrated : liveQuery.isLoading,
    isEmpty: !mockOn && hydrated && !liveQuery.isLoading && (bundle?.events.length ?? 0) === 0,
  };
}
