"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDetailLiquidity } from "@/features/markets/crypto/symbol-detail/lib/fetch-liquidity";
import { detailQueryOptions } from "@/features/markets/crypto/symbol-detail/lib/detail-query-options";

const REFETCH_MS = 10_000;

export function useDetailLiquidity(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cdr-liquidity", sym],
    queryFn: () => fetchDetailLiquidity(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
