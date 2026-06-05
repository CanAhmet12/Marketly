"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchTrendingSignals } from "@/features/home/fetch-home-extras";
import { useHomeEditorialChips } from "@/features/home/hooks/use-home-editorial-chips";
import { useRecommendedCreators } from "@/features/home/hooks/use-recommended-creators";
import {
  buildHomeAmbientSummaryFromLive,
  buildLiveMarketPulseFromAssets,
} from "@/features/home/lib/build-home-live-intelligence";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { fetchWatchlistFromDb } from "@/features/markets/fetch-watchlist";
import { buildLiveRecommendations } from "@/features/personalization/lib/build-live-recommendations";
import { fetchSavedPosts } from "@/features/social/fetch-saved-posts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useHomeLiveContext(viewerId: string | null) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const { assets } = useMarketAssetsLive();
  const { creators } = useRecommendedCreators();
  const { chips } = useHomeEditorialChips();

  const contextQuery = useQuery({
    queryKey: ["home-live-context", viewerId ?? "anon"],
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      const [watchSymbols, savedPosts, signals, followingRes] = await Promise.all([
        viewerId ? fetchWatchlistFromDb(client, viewerId) : Promise.resolve([] as string[]),
        viewerId ? fetchSavedPosts(client, viewerId) : Promise.resolve([]),
        fetchTrendingSignals(client, 10),
        viewerId
          ? client.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", viewerId)
          : Promise.resolve({ count: 0 }),
      ]);
      const savedAssetTags = savedPosts.map((p) => p.asset_tag).filter((t): t is string => Boolean(t?.trim()));
      return {
        watchSymbols,
        savedAssetTags,
        signals,
        followingCount: followingRes.count ?? 0,
      };
    },
    enabled: liveMode,
    staleTime: 120_000,
  });

  const summary = useMemo(() => {
    if (mockOn) return null;
    if (chips.pulseSummary) return chips.pulseSummary;
    if (assets.length === 0) return null;
    return buildHomeAmbientSummaryFromLive(assets, contextQuery.data?.signals ?? []);
  }, [mockOn, chips.pulseSummary, assets, contextQuery.data?.signals]);

  const pulse = useMemo(() => {
    if (mockOn || assets.length === 0) return null;
    return buildLiveMarketPulseFromAssets(assets);
  }, [mockOn, assets]);

  const recommendations = useMemo(() => {
    if (mockOn || !contextQuery.data) return null;
    return buildLiveRecommendations({
      creators,
      signals: contextQuery.data.signals,
      watchSymbols: contextQuery.data.watchSymbols,
      savedAssetTags: contextQuery.data.savedAssetTags,
      followingCount: contextQuery.data.followingCount,
    });
  }, [mockOn, contextQuery.data, creators]);

  return {
    liveMode,
    mockOn,
    summary,
    pulse,
    recommendations,
    isLoading: liveMode && contextQuery.isLoading,
  };
}
