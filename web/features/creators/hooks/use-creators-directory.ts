"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { fetchCreatorsDirectory } from "@/features/creators/fetch-creators-directory";
import { getCreatorsRepository } from "@/features/creators/repository";
import { filterCreators } from "@/features/creators/lib/filter-and-sort-creators";
import type { CreatorFilters } from "@/features/creators/creators-filters";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useCreatorsDirectory(filters: CreatorFilters) {
  const { user } = useAuth();
  const viewerId = user?.id ?? null;

  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.creatorsDirectory(viewerId),
    queryFn: async () => {
      if (liveMode) return fetchCreatorsDirectory(getSupabaseBrowserClient(), viewerId);
      return getCreatorsRepository().getDirectoryPayload(viewerId);
    },
    staleTime: 60_000,
    enabled: mockOn || liveMode,
  });

  const payload = query.data;

  const filtered = useMemo(() => {
    if (!payload) return [];
    return filterCreators(payload.creators, filters, viewerId);
  }, [payload, filters, viewerId]);

  const byId = useMemo(() => {
    const m = new Map<string, (typeof filtered)[0]>();
    for (const c of payload?.creators ?? []) m.set(c.id, c);
    return m;
  }, [payload?.creators]);

  const featured = useMemo(() => {
    if (!payload) return [];
    return payload.featuredIds.map((id) => byId.get(id)).filter(Boolean) as NonNullable<(typeof filtered)[0]>[];
  }, [payload, byId]);

  const liveNow = useMemo(() => {
    if (!payload) return [];
    return payload.liveNowIds.map((id) => byId.get(id)).filter(Boolean) as NonNullable<(typeof filtered)[0]>[];
  }, [payload, byId]);

  return {
    query,
    payload,
    filtered,
    featured,
    liveNow,
    viewerId,
  };
}
