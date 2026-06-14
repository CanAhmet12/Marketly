"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchForexDetailMarketPulse } from "@/features/markets/forex/symbol-detail/lib/fetch-forex-market-pulse";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useForexDetailMarketPulse(
  symbol: string,
  changePct?: number,
  enabled = true,
) {
  const sym = symbol.trim().toUpperCase().replace("/", "");

  return useQuery({
    queryKey: ["fx-market-pulse", sym, changePct ?? null],
    queryFn: () => fetchForexDetailMarketPulse(sym, changePct),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
