"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

type SignalRowPatch = {
  id?: string;
  likes_count?: number;
  copies_count?: number;
};

/** Feed kartlarında beğeni/kopya sayaçlarını canlı günceller */
export function useSignalsRealtime(signalIds: readonly string[], enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || isMockDataEnabled() || !isSupabaseConfigured() || signalIds.length === 0) return;

    const idSet = new Set(signalIds);
    const client = getSupabaseBrowserClient();

    const channel = client
      .channel("signals-feed-counts")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "signals" },
        (payload) => {
          const patch = payload.new as SignalRowPatch;
          const id = patch.id ? String(patch.id) : "";
          if (!id || !idSet.has(id)) return;
          if (patch.likes_count == null && patch.copies_count == null) return;

          queryClient.setQueriesData<SignalsFeedRow[]>({ queryKey: queryKeys.signalsFeed() }, (old) => {
            if (!old?.length) return old;
            return old.map((r) =>
              r.id === id
                ? {
                    ...r,
                    ...(patch.likes_count != null ? { likes_count: patch.likes_count } : {}),
                    ...(patch.copies_count != null ? { copies_count: patch.copies_count } : {}),
                  }
                : r,
            );
          });
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [enabled, queryClient, signalIds]);
}
