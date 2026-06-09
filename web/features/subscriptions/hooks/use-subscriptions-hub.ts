"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchMembershipDetail } from "@/features/subscriptions/fetch-membership-catalog";
import {
  buildEmptySubscriptionsHubPayload,
  fetchSubscriptionsHubLive,
} from "@/features/subscriptions/lib/fetch-subscriptions-hub-live";
import { getSubscriptionRepository } from "@/features/subscriptions/repository";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useSubscriptionsHub(viewerId: string | null) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const mockPayload = useMemo(
    () => getSubscriptionRepository().getSubscriptionsHub(viewerId),
    [viewerId, mockOn],
  );

  const query = useQuery({
    queryKey: queryKeys.membershipHub(viewerId),
    queryFn: () => fetchSubscriptionsHubLive(getSupabaseBrowserClient(), viewerId),
    enabled: liveMode,
    staleTime: 180_000,
  });

  return {
    payload: mockOn ? mockPayload : (query.data ?? buildEmptySubscriptionsHubPayload()),
    isLoading: liveMode && query.isLoading,
    isError: liveMode && query.isError,
    error: query.error,
    refetch: query.refetch,
    mockOn,
    liveMode,
  };
}

export function useMembershipDetail(creatorId: string, viewerId: string | null) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();

  const mockDetail = useMemo(
    () => getSubscriptionRepository().getMembershipDetail(creatorId, viewerId),
    [creatorId, viewerId, mockOn],
  );

  const query = useQuery({
    queryKey: queryKeys.membershipDetail(creatorId, viewerId),
    queryFn: () => fetchMembershipDetail(getSupabaseBrowserClient(), creatorId, viewerId),
    enabled: liveMode && Boolean(creatorId),
    staleTime: 180_000,
  });

  return {
    detail: mockOn ? mockDetail : (query.data ?? null),
    isLoading: liveMode && query.isLoading,
    isError: liveMode && query.isError,
    error: query.error,
    refetch: query.refetch,
    mockOn,
    liveMode,
  };
}
