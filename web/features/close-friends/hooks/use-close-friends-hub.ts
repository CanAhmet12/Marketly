"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCircleDetailLive } from "@/features/close-friends/lib/fetch-circle-detail-live";
import {
  buildEmptyCloseFriendsHubPayload,
  fetchCloseFriendsHubLive,
} from "@/features/close-friends/lib/fetch-close-friends-hub-live";
import { getCloseFriendsRepository } from "@/features/close-friends/repository";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useCloseFriendsHub(viewerId: string | null) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.closeFriendsHub(viewerId),
    queryFn: () =>
      mockOn
        ? Promise.resolve(getCloseFriendsRepository().getPrivateCirclesHub(viewerId))
        : fetchCloseFriendsHubLive(getSupabaseBrowserClient(), viewerId),
    enabled: mockOn || (liveMode && Boolean(viewerId)),
    staleTime: mockOn ? 0 : 180_000,
  });

  return {
    payload: query.data ?? buildEmptyCloseFriendsHubPayload(),
    isLoading: query.isLoading && (mockOn || Boolean(viewerId)),
    isError: !mockOn && query.isError,
    refetch: query.refetch,
    mockOn,
    liveMode,
  };
}

export function useCircleDetail(circleId: string, viewerId: string | null) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const query = useQuery({
    queryKey: queryKeys.closeFriendsCircle(circleId, viewerId),
    queryFn: () =>
      mockOn
        ? Promise.resolve(getCloseFriendsRepository().getCircleDetail(circleId, viewerId))
        : fetchCircleDetailLive(getSupabaseBrowserClient(), circleId, viewerId),
    enabled: Boolean(circleId) && (mockOn || (liveMode && Boolean(viewerId))),
    staleTime: mockOn ? 0 : 180_000,
  });

  return {
    detail: query.data ?? null,
    isLoading: query.isLoading,
    isError: !mockOn && query.isError,
    refetch: query.refetch,
    mockOn,
    liveMode,
  };
}
