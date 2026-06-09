"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { fetchSignalsFeed } from "@/features/signals/fetch-signals-feed";
import { useSignalRecommendations } from "@/features/signals/hooks/use-signal-recommendations";
import { getSignalRecommendationsCache } from "@/features/signals/signal-recommendations-cache";
import { fetchAnalystLeaderboardFromRpc } from "@/features/signals/fetch-signals-rpc";
import { computeSignalsHero } from "@/features/signals/lib/compute-signals-hero";
import {
  buildAnalystLeaderboardSections,
  buildMarketSignalIntelligence,
} from "@/features/signals/lib/signal-intelligence-build";
import { buildLiveSignalsMarketplaceRails } from "@/features/signals/lib/build-live-signals-marketplace-rails";
import { buildSignalsMarketplaceRails } from "@/features/signals/lib/signals-marketplace-build";
import { getSignalsRepository } from "@/features/signals/repository";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useSignalsCatalog() {
  const { user } = useAuth();
  const mounted = useClientMounted();
  const mockOn = isMockDataEnabled();
  const supabaseOn = mounted && !mockOn && isSupabaseConfigured();
  const pSnap = usePersonalizationSnapshot();
  const repo = useMemo(() => getSignalsRepository(), []);
  const userId = user?.id ?? null;
  const { rev: recRev } = useSignalRecommendations();

  const feedQuery = useQuery({
    queryKey: [...queryKeys.signalsFeed(), userId ?? "anon"] as const,
    queryFn: () => fetchSignalsFeed(getSupabaseBrowserClient(), 120, userId),
    enabled: supabaseOn,
    staleTime: 60_000,
  });

  const leaderboardQuery = useQuery({
    queryKey: [...queryKeys.signalsFeed(), "leaderboard-rpc"] as const,
    queryFn: () => fetchAnalystLeaderboardFromRpc(getSupabaseBrowserClient(), 12),
    enabled: supabaseOn,
    staleTime: 120_000,
  });

  const rows = mockOn ? repo.getFeedRows() : (feedQuery.data ?? []);
  const isLoading = supabaseOn && feedQuery.isFetching && rows.length === 0;
  const isError = supabaseOn && feedQuery.isError;

  const hero = useMemo(() => computeSignalsHero(rows), [rows]);

  const marketIntel = useMemo(() => buildMarketSignalIntelligence(rows), [rows]);

  const leaderboardSections = useMemo(() => {
    if (mockOn) return buildAnalystLeaderboardSections(rows);
    const fromRpc = leaderboardQuery.data ?? [];
    if (fromRpc.length) return fromRpc;
    return buildAnalystLeaderboardSections(rows);
  }, [rows, mockOn, leaderboardQuery.data]);

  const rails = useMemo(() => {
    if (mockOn) {
      const affinity = pSnap.affinity;
      return buildSignalsMarketplaceRails(rows, affinity);
    }
    void recRev;
    const recs = getSignalRecommendationsCache(userId);
    return buildLiveSignalsMarketplaceRails(rows, recs);
  }, [rows, mockOn, pSnap.affinity, recRev, userId]);

  const query = feedQuery;

  return {
    rows,
    hero,
    marketIntel,
    leaderboardSections,
    rails,
    isLoading,
    isError,
    mockOn,
    supabaseOn,
    refetch: query.refetch,
  };
}
