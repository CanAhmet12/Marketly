"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCommodityDetailDerivatives } from "@/features/markets/commodities/symbol-detail/lib/fetch-commodity-derivatives";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 45_000;

export function useCommodityDetailDerivatives(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cmr-derivatives", sym],
    queryFn: () => fetchCommodityDetailDerivatives(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
