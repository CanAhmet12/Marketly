"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import {
  fetchCreatorRecommendations,
  fetchSignalRecommendations,
} from "@/features/signals/fetch-signal-recommendations";
import { setSignalRecommendationsCache } from "@/features/signals/signal-recommendations-cache";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { AlgoFlags } from "@/lib/algo-flags";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

/** CF önerilerini yükler ve önbelleğe yazar */
export function useSignalRecommendations() {
  const { user } = useAuth();
  const mounted = useClientMounted();
  const userId = user?.id ?? null;
  const enabled = mounted && !isMockDataEnabled() && isSupabaseConfigured() && AlgoFlags.signalCollaborativeFilter;

  const query = useQuery({
    queryKey: queryKeys.signalRecommendations(userId ?? "anon"),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      const [signals, creators] = await Promise.all([
        fetchSignalRecommendations(client, userId, 10),
        fetchCreatorRecommendations(client, userId, 5),
      ]);
      setSignalRecommendationsCache(userId, signals, creators);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("marketly-signal-recommendations-updated"));
      }
      return { signals, creators };
    },
    enabled,
    staleTime: 180_000,
  });

  return { rev: query.dataUpdatedAt, isLoading: enabled && query.isLoading };
}
