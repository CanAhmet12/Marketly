"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchPortfolioHoldings,
  type PortfolioHoldingLive,
} from "@/features/markets/fetch-portfolio-holdings";
import {
  upsertPortfolioHolding,
  type UpsertPortfolioHoldingInput,
} from "@/features/markets/upsert-portfolio-holding";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isWebWriteEnabled } from "@/lib/supabase/write-guard";
import { isMockDataEnabled } from "@/mock/config";

export function usePortfolioHoldings(userId: string | null | undefined) {
  const mockOn = isMockDataEnabled();
  const enabled = !mockOn && isSupabaseConfigured() && Boolean(userId);
  const qc = useQueryClient();

  const query = useQuery<PortfolioHoldingLive[]>({
    queryKey: queryKeys.portfolioHoldings(userId),
    queryFn: () => fetchPortfolioHoldings(getSupabaseBrowserClient(), userId!),
    enabled,
    staleTime: 30_000,
  });

  const upsertMutation = useMutation({
    mutationFn: async (input: UpsertPortfolioHoldingInput) => {
      const result = await upsertPortfolioHolding(getSupabaseBrowserClient(), userId!, input);
      if (!result.ok) throw new Error(result.error);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.portfolioHoldings(userId) });
    },
  });

  return {
    holdings: query.data ?? [],
    isLoading: enabled && query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    upsertHolding: upsertMutation.mutateAsync,
    upsertPending: upsertMutation.isPending,
    writeEnabled: mockOn || isWebWriteEnabled(),
  };
}
