"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { fetchSignalsFeed } from "@/features/signals/fetch-signals-feed";
import { mapFeedRowToSignalCardItem } from "@/features/signals/lib/map-feed-row-to-signal-card-item";
import { getSignalsRepository } from "@/features/signals/repository";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export const SIGNALS_DISCOVER_PREVIEW_LIMIT = 12;

/** Keşfet `?tab=signals` — hafif önizleme beslemesi (tam katalog değil) */
export function useSignalsDiscoverPreview() {
  const { user } = useAuth();
  const mounted = useClientMounted();
  const mockOn = isMockDataEnabled();
  const supabaseOn = mounted && !mockOn && isSupabaseConfigured();
  const userId = user?.id ?? null;
  const repo = useMemo(() => getSignalsRepository(), []);

  const query = useQuery({
    queryKey: [...queryKeys.signalsDiscoverPreview(), userId ?? "anon"] as const,
    queryFn: async () => {
      const rows = await fetchSignalsFeed(getSupabaseBrowserClient(), SIGNALS_DISCOVER_PREVIEW_LIMIT, userId, {
        scope: "live",
        sort: "trending",
      });
      return rows.map(mapFeedRowToSignalCardItem);
    },
    enabled: supabaseOn,
    staleTime: 60_000,
  });

  const items = mockOn
    ? repo.getFeedRows().slice(0, SIGNALS_DISCOVER_PREVIEW_LIMIT).map(mapFeedRowToSignalCardItem)
    : (query.data ?? []);

  const isLoading = supabaseOn && query.isFetching && items.length === 0;
  const isError = supabaseOn && query.isError;

  return {
    items,
    isLoading,
    isError,
    mockOn,
    supabaseOn,
    refetch: query.refetch,
  };
}
