"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDetailMarketsComparison } from "@/features/markets/crypto/symbol-detail/lib/fetch-markets-comparison";
import { detailQueryOptions } from "@/features/markets/crypto/symbol-detail/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useDetailMarketsComparison(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cdr-markets-comparison", sym],
    queryFn: () => fetchDetailMarketsComparison(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
