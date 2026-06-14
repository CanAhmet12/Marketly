"use client";

import { useQuery } from "@tanstack/react-query";

import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchBistDetailMarketPulse } from "@/features/markets/bist/symbol-detail/lib/fetch-bist-market-pulse";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useBistDetailMarketPulse(symbol: string, changePct?: number) {
  const sym = normalizeBistSymbol(symbol);

  return useQuery({
    queryKey: ["bc-market-pulse", sym, changePct ?? 0],
    queryFn: () => fetchBistDetailMarketPulse(sym, changePct),
    enabled: sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
