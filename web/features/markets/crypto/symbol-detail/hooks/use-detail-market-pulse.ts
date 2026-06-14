"use client";

import { fetchDetailMarketPulse } from "@/features/markets/crypto/symbol-detail/lib/fetch-market-pulse";
import { detailQueryOptions } from "@/features/markets/crypto/symbol-detail/lib/detail-query-options";
import { useDetailQueryData } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-query-data";

const REFETCH_MS = 60_000;

export function useDetailMarketPulse(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useDetailQueryData({
    queryKey: ["cdr-market-pulse", sym],
    queryFn: () => fetchDetailMarketPulse(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
