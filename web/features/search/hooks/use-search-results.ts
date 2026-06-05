"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { fetchSearchResults, splitPostsByKind } from "@/features/search/fetch-search-results";
import { computeSearchTabCounts } from "@/features/search/lib/search-tab-counts";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockSearchResults } from "@/mock/adapters/search";
import { isMockDataEnabled } from "@/mock/config";

export function useSearchResults(rawQ: string, canSearch: boolean) {
  const { isInitialized, configError } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.globalSearch(rawQ),
    enabled: (isMockDataEnabled() || (isInitialized && isSupabaseConfigured())) && canSearch,
    queryFn: async () => {
      if (isMockDataEnabled()) return mockSearchResults(rawQ);
      return fetchSearchResults(getSupabaseBrowserClient(), rawQ);
    },
    staleTime: 30_000,
  });

  const bundle = query.data;
  const split = useMemo(() => splitPostsByKind(bundle?.posts ?? []), [bundle?.posts]);
  const counts = useMemo(() => computeSearchTabCounts(bundle, split), [bundle, split]);

  const configOk = isMockDataEnabled() || (isInitialized && isSupabaseConfigured() && !configError);

  return {
    query,
    bundle,
    split,
    counts,
    configOk,
    configError,
    discussions: bundle?.discussions ?? [],
    communities: bundle?.communities ?? [],
    creatorRooms: bundle?.creatorRooms ?? [],
  };
}
