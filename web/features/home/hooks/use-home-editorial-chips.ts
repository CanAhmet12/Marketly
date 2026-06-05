"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchHomeEditorialChips } from "@/features/home/fetch-home-editorial-chips";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useHomeEditorialChips() {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.homeEditorialChips(),
    queryFn: () => fetchHomeEditorialChips(getSupabaseBrowserClient()),
    enabled: liveMode,
    staleTime: 90_000,
  });

  return {
    chips: query.data ?? { today: [], trending: [], interests: [], pulseSummary: "" },
    isLoading: liveMode && query.isLoading,
    mockOn,
    liveMode,
  };
}
