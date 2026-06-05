"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRecommendedCreators } from "@/features/home/fetch-home-extras";
import { getHomeRepository } from "@/features/home/repository";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useRecommendedCreators() {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.recommendedCreators(),
    queryFn: async () => {
      if (liveMode) return fetchRecommendedCreators(getSupabaseBrowserClient());
      return getHomeRepository().getRecommendedCreators();
    },
    staleTime: 120_000,
    enabled: mockOn || liveMode,
  });

  return {
    creators: query.data ?? [],
    isLoading: liveMode && query.isLoading,
    mockOn,
    liveMode,
  };
}
