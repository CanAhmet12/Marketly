"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCommodityDetailMarketPulse } from "@/features/markets/commodities/symbol-detail/lib/fetch-commodity-market-pulse";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useCommodityDetailMarketPulse(
  symbol: string,
  changePct?: number,
  enabled = true,
) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cmr-market-pulse", sym, changePct ?? null],
    queryFn: () => fetchCommodityDetailMarketPulse(sym, changePct),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
