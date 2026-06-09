"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { CloseFriendCandidate } from "@/features/close-friends/domain/types";
import {
  fetchFollowingCandidates,
  fetchMockFollowingCandidates,
} from "@/features/close-friends/lib/fetch-following-candidates";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useFollowingCandidates(viewerId: string | null, trustedIds: string[]) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const exclude = useMemo(() => new Set(trustedIds), [trustedIds]);

  const mockCandidates = useMemo(
    () => (mockOn ? fetchMockFollowingCandidates(exclude) : []),
    [mockOn, exclude],
  );

  const query = useQuery({
    queryKey: queryKeys.closeFriendsCandidates(viewerId, trustedIds),
    queryFn: () => fetchFollowingCandidates(getSupabaseBrowserClient(), viewerId!, exclude),
    enabled: liveMode && Boolean(viewerId),
    staleTime: 120_000,
  });

  const candidates: CloseFriendCandidate[] = mockOn ? mockCandidates : (query.data ?? []);

  return {
    candidates,
    isLoading: liveMode && query.isLoading,
    mockOn,
  };
}
