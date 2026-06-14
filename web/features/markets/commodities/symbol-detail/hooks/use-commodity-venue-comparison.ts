"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCommodityDetailVenueComparison } from "@/features/markets/commodities/symbol-detail/lib/fetch-commodity-venue-comparison";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useCommodityDetailVenueComparison(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cmr-venue-comparison", sym],
    queryFn: () => fetchCommodityDetailVenueComparison(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
