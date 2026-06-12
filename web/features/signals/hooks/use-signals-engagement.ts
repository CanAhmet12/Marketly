"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import {
  fetchUserSignalEngagement,
  rpcCopySignalOnce,
  rpcToggleSignalLike,
} from "@/features/signals/fetch-signal-engagement";
import { logSignalInteraction } from "@/features/signals/fetch-signal-recommendations";
import { notifySignalCopied } from "@/features/signals/lib/notify-signal-copied";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

function patchFeedRows(
  rows: SignalsFeedRow[] | undefined,
  signalId: string,
  patch: Partial<Pick<SignalsFeedRow, "likes_count" | "copies_count" | "community_copies_24h">>,
): SignalsFeedRow[] | undefined {
  if (!rows?.length) return rows;
  return rows.map((r) => {
    if (r.id !== signalId) return r;
    const next = { ...r, ...patch };
    if (patch.community_copies_24h === undefined && patch.copies_count != null) {
      next.community_copies_24h = (r.community_copies_24h ?? 0) + 1;
    }
    return next;
  });
}

function findFeedRow(queryClient: QueryClient, signalId: string): SignalsFeedRow | null {
  const entries = queryClient.getQueriesData<SignalsFeedRow[]>({ queryKey: queryKeys.signalsFeed() });
  for (const [, rows] of entries) {
    const hit = rows?.find((r) => r.id === signalId);
    if (hit) return hit;
  }
  return null;
}

/** Katalog + detay — beğeni/kopya RPC + feed cache güncelleme */
export function useSignalsEngagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mockOn = isMockDataEnabled();
  const supabaseOn = !mockOn && isSupabaseConfigured();
  const userId = user?.id ?? null;

  const stateQuery = useQuery({
    queryKey: [...queryKeys.signalsEngagement(), userId ?? "anon"] as const,
    queryFn: () => fetchUserSignalEngagement(getSupabaseBrowserClient(), userId!),
    enabled: supabaseOn && !!userId,
    staleTime: 30_000,
  });

  const likedIds = useMemo(() => stateQuery.data?.likedIds ?? new Set<string>(), [stateQuery.data]);
  const copiedIds = useMemo(() => stateQuery.data?.copiedIds ?? new Set<string>(), [stateQuery.data]);

  const patchCaches = useCallback(
    (signalId: string, patch: Partial<Pick<SignalsFeedRow, "likes_count" | "copies_count" | "community_copies_24h">>) => {
      queryClient.setQueriesData<SignalsFeedRow[]>({ queryKey: queryKeys.signalsFeed() }, (old) =>
        patchFeedRows(old, signalId, patch),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.signalThreadPack(signalId) });
    },
    [queryClient],
  );

  const likeMutation = useMutation({
    mutationFn: async (signalId: string) => {
      if (!userId) throw new Error("auth_required");
      return rpcToggleSignalLike(getSupabaseBrowserClient(), userId, signalId);
    },
    onSuccess: (result, signalId) => {
      if (!result) return;
      queryClient.setQueryData<typeof stateQuery.data>(
        [...queryKeys.signalsEngagement(), userId ?? "anon"],
        (old) => {
          const liked = new Set(old?.likedIds ?? []);
          if (result.liked) liked.add(signalId);
          else liked.delete(signalId);
          return { likedIds: liked, copiedIds: old?.copiedIds ?? new Set() };
        },
      );
      patchCaches(signalId, { likes_count: result.new_count });
      void logSignalInteraction(getSupabaseBrowserClient(), signalId, result.liked ? "like" : "view");
    },
  });

  const copyMutation = useMutation({
    mutationFn: async (signalId: string) => {
      if (!userId) throw new Error("auth_required");
      return rpcCopySignalOnce(getSupabaseBrowserClient(), userId, signalId);
    },
    onSuccess: (result, signalId) => {
      if (!result?.copied) return;
      queryClient.setQueryData<typeof stateQuery.data>(
        [...queryKeys.signalsEngagement(), userId ?? "anon"],
        (old) => {
          const copied = new Set(old?.copiedIds ?? []);
          copied.add(signalId);
          return { likedIds: old?.likedIds ?? new Set(), copiedIds: copied };
        },
      );
      patchCaches(signalId, { copies_count: result.new_count });
      void queryClient.invalidateQueries({ queryKey: queryKeys.signalsFeed() });
      void logSignalInteraction(getSupabaseBrowserClient(), signalId, "copy");

      const row = findFeedRow(queryClient, signalId);
      if (row && userId) {
        void notifySignalCopied(getSupabaseBrowserClient(), {
          creatorId: row.creator_id,
          copierId: userId,
          signalId,
          symbol: row.symbol,
        });
      }
    },
  });

  const toggleLike = useCallback(
    (signalId: string) => {
      if (!userId || mockOn) return;
      likeMutation.mutate(signalId);
    },
    [userId, mockOn, likeMutation],
  );

  const copySignal = useCallback(
    (signalId: string) => {
      if (!userId || mockOn) return;
      if (copiedIds.has(signalId)) return;
      copyMutation.mutate(signalId);
    },
    [userId, mockOn, copiedIds, copyMutation],
  );

  const isLiked = useCallback((signalId: string) => likedIds.has(signalId), [likedIds]);
  const isCopied = useCallback((signalId: string) => copiedIds.has(signalId), [copiedIds]);

  return {
    userId,
    canEngage: supabaseOn && !!userId,
    isLiked,
    isCopied,
    toggleLike,
    copySignal,
    likingId: likeMutation.isPending ? likeMutation.variables : null,
    copyingId: copyMutation.isPending ? copyMutation.variables : null,
  };
}
