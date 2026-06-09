"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRecommendedCreators } from "@/features/home/fetch-home-extras";
import { getHomeRepository } from "@/features/home/repository";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useRecommendedCreators() {
  const mounted = useClientMounted();
  const mockOn = isMockDataEnabled();
  const liveMode = mounted && !mockOn && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.recommendedCreators(),
    queryFn: async () => {
      if (liveMode) return fetchRecommendedCreators(getSupabaseBrowserClient());
      return getHomeRepository().getRecommendedCreators();
    },
    staleTime: 120_000,
    enabled: mounted && (mockOn || liveMode),
  });

  return {
    creators: query.data ?? [],
    isLoading: liveMode && query.isLoading,
    mockOn,
    liveMode,
  };
}
