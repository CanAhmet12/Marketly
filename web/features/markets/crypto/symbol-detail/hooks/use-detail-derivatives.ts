"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDetailDerivatives } from "@/features/markets/crypto/symbol-detail/lib/fetch-derivatives";
import { detailQueryOptions } from "@/features/markets/crypto/symbol-detail/lib/detail-query-options";
import { useDetailQueryData } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-query-data";

const REFETCH_MS = 120_000;

export function useDetailDerivatives(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useDetailQueryData({
    queryKey: ["cdr-derivatives", sym],
    queryFn: () => fetchDetailDerivatives(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
