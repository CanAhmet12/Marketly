"use client";

import { useQuery } from "@tanstack/react-query";

import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchBistDetailPeerComparison } from "@/features/markets/bist/symbol-detail/lib/fetch-bist-peer-comparison";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 120_000;

export function useBistDetailPeerComparison(symbol: string) {
  const sym = normalizeBistSymbol(symbol);

  return useQuery({
    queryKey: ["bc-peer-comparison", sym],
    queryFn: () => fetchBistDetailPeerComparison(sym),
    enabled: sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
