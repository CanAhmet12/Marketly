"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchMarketNewsRows } from "@/features/markets/fetch-market-news";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { emptyAssetIntelligenceBundle } from "@/features/markets/lib/asset-intelligence-empty";
import { tryBuildAssetIntelligenceFromLive } from "@/features/markets/lib/live-richness/build-asset-intelligence-from-live";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { getMarketsRepository } from "@/features/markets/repository";
import { fetchSignalsFeed } from "@/features/signals/fetch-signals-feed";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useAssetIntelligence(symbol: string): {
  bundle: AssetIntelligenceBundle | null;
  isLoading: boolean;
  mockOn: boolean;
} {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets, isLoading: assetsLoading } = useMarketAssetsLive();

  const signalsQuery = useQuery({
    queryKey: queryKeys.signalsFeed(),
    queryFn: () => fetchSignalsFeed(getSupabaseBrowserClient()),
    enabled: liveMode,
    staleTime: 60_000,
  });

  const newsQuery = useQuery({
    queryKey: ["market-news-rows", "asset-intel"] as const,
    queryFn: () => fetchMarketNewsRows(getSupabaseBrowserClient(), 40),
    enabled: liveMode,
    staleTime: 120_000,
  });

  const bundle = useMemo(() => {
    const s = symbol.trim();
    if (!s) return null;
    if (mockOn) return repo.getAssetIntelligenceBundle(s);
    const built = tryBuildAssetIntelligenceFromLive(
      s,
      assets,
      signalsQuery.data ?? [],
      newsQuery.data ?? [],
    );
    if (built) return built;
    return emptyAssetIntelligenceBundle(s);
  }, [symbol, mockOn, repo, assets, signalsQuery.data, newsQuery.data]);

  const isLoading =
    !mockOn &&
    (assetsLoading || (liveMode && (signalsQuery.isLoading || newsQuery.isLoading)));

  return { bundle, isLoading, mockOn };
}
