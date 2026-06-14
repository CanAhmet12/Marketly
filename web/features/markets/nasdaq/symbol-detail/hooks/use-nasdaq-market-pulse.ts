"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchNasdaqDetailMarketPulse } from "@/features/markets/nasdaq/symbol-detail/lib/fetch-nasdaq-market-pulse";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useNasdaqDetailMarketPulse(
  symbol: string,
  changePct?: number,
  enabled = true,
) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["nqx-market-pulse", sym, changePct ?? null],
    queryFn: () => fetchNasdaqDetailMarketPulse(sym, changePct),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
