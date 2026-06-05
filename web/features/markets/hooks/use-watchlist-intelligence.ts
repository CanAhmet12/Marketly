"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { buildWatchlistIntelligenceFromLive } from "@/features/markets/lib/live-richness/build-watchlist-intelligence-from-live";
import type { WatchlistIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import { getMarketsRepository } from "@/features/markets/repository";
import { fetchSignalsFeed } from "@/features/signals/fetch-signals-feed";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useWatchlistIntelligence(
  watchedSymbols: readonly string[],
  pinnedSymbols: readonly string[],
): WatchlistIntelligenceBundle {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets } = useMarketAssetsLive();

  const signalsQuery = useQuery({
    queryKey: queryKeys.signalsFeed(),
    queryFn: () => fetchSignalsFeed(getSupabaseBrowserClient()),
    enabled: liveMode,
    staleTime: 60_000,
  });

  return useMemo(() => {
    if (mockOn) {
      return repo.getWatchlistIntelligenceBundle(watchedSymbols, pinnedSymbols);
    }
    return buildWatchlistIntelligenceFromLive({
      watchedSymbols,
      pinnedSymbols,
      assets,
      signals: signalsQuery.data ?? [],
    });
  }, [mockOn, repo, watchedSymbols, pinnedSymbols, assets, signalsQuery.data]);
}
