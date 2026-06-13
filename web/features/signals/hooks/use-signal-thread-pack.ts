"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSignalThreadPack } from "@/features/signals/fetch-signal-thread-pack";
import { buildSignalThreadPackFromRow } from "@/features/signals/lib/build-signal-thread-pack";
import { getSignalsRepository } from "@/features/signals/repository";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

/** Detay modal/sayfa — `get_signal_thread_pack` veya mock paket */
export function useSignalThreadPack(row: SignalsFeedRow | null) {
  const mockOn = isMockDataEnabled();
  const supabaseOn = !mockOn && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.signalThreadPack(row?.id ?? ""),
    queryFn: async () => {
      if (!row) return null;
      if (mockOn) return getSignalsRepository().getSignalThreadPack(row.id);
      const rpc = await fetchSignalThreadPack(getSupabaseBrowserClient(), row.id);
      return buildSignalThreadPackFromRow(row, rpc);
    },
    enabled: Boolean(row) && (mockOn || supabaseOn),
    staleTime: 60_000,
  });

  return query.data ?? null;
}
