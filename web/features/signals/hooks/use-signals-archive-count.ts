"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchArchivedSignalsCount } from "@/features/signals/fetch-signals-feed";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useSignalsArchiveCount() {
  const mounted = useClientMounted();
  const enabled = mounted && !isMockDataEnabled() && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.signalsArchiveCount(),
    queryFn: () => fetchArchivedSignalsCount(getSupabaseBrowserClient()),
    enabled,
    staleTime: 120_000,
  });

  return query.data ?? 0;
}
