"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  buildSubscriptionsHubPayload,
  fetchMembershipCatalog,
  fetchMembershipDetail,
} from "@/features/subscriptions/fetch-membership-catalog";
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
    queryKey: queryKeys.membershipCatalog(),
    queryFn: async () => {
      const catalog = await fetchMembershipCatalog(getSupabaseBrowserClient());
      return buildSubscriptionsHubPayload(catalog);
    },
    enabled: liveMode,
    staleTime: 180_000,
  });

  return {
    payload: mockOn ? mockPayload : (query.data ?? buildSubscriptionsHubPayload([])),
    isLoading: liveMode && query.isLoading,
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
    queryKey: queryKeys.membershipDetail(creatorId),
    queryFn: () => fetchMembershipDetail(getSupabaseBrowserClient(), creatorId),
    enabled: liveMode && Boolean(creatorId),
    staleTime: 180_000,
  });

  return {
    detail: mockOn ? mockDetail : (query.data ?? null),
    isLoading: liveMode && query.isLoading,
    mockOn,
    liveMode,
  };
}
