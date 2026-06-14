"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCommodityDetailSpreadSession } from "@/features/markets/commodities/symbol-detail/lib/fetch-commodity-spread-session";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 30_000;

export function useCommodityDetailSpreadSession(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cmr-spread-session", sym],
    queryFn: () => fetchCommodityDetailSpreadSession(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
