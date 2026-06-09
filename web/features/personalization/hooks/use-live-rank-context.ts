"use client";

import { useQuery } from "@tanstack/react-query";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

import { fetchLiveRankContext } from "../fetch-live-rank-context";
import { setLiveRankContextCache } from "../live-rank-context-cache";

/** Canlı modda feed sıralama bağlamını Supabase'den yükler ve önbelleğe yazar */
export function useLiveRankContext(userId: string | null) {
  const mounted = useClientMounted();
  const mockOn = isMockDataEnabled();
  const liveMode = mounted && !mockOn && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.liveRankContext(userId ?? "anon"),
    queryFn: async () => {
      const ctx = await fetchLiveRankContext(getSupabaseBrowserClient(), userId);
      setLiveRankContextCache(userId, ctx);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
      }
      return ctx;
    },
    enabled: liveMode,
    staleTime: 120_000,
  });

  return {
    rev: query.dataUpdatedAt,
    isLoading: liveMode && query.isLoading,
  };
}
