"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDetailTokenomics } from "@/features/markets/crypto/symbol-detail/lib/fetch-tokenomics";
import { detailQueryOptions } from "@/features/markets/crypto/symbol-detail/lib/detail-query-options";

const REFETCH_MS = 300_000;

export function useDetailTokenomics(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cdr-tokenomics", sym],
    queryFn: () => fetchDetailTokenomics(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
