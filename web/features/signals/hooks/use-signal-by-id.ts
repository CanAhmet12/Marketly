"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { fetchSignalById } from "@/features/signals/fetch-signal-by-id";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

/** Katalogda olmayan sinyal ID'leri için lazy detay fetch */
export function useSignalById(signalId: string | null, enabled = true) {
  const { user } = useAuth();
  const mounted = useClientMounted();
  const mockOn = isMockDataEnabled();
  const supabaseOn = mounted && !mockOn && isSupabaseConfigured();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: queryKeys.signalDetail(signalId ?? "", userId ?? "anon"),
    queryFn: () => fetchSignalById(getSupabaseBrowserClient(), signalId!, userId),
    enabled: enabled && supabaseOn && !!signalId,
    staleTime: 60_000,
  });
}
