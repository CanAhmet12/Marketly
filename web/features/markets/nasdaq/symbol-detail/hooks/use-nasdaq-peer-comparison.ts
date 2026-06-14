"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchNasdaqDetailPeerComparison } from "@/features/markets/nasdaq/symbol-detail/lib/fetch-nasdaq-peer-comparison";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useNasdaqDetailPeerComparison(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["nqx-peer-comparison", sym],
    queryFn: () => fetchNasdaqDetailPeerComparison(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
