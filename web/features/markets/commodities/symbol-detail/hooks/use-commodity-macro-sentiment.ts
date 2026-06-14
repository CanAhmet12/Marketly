"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCommodityDetailMacroSentiment } from "@/features/markets/commodities/symbol-detail/lib/fetch-commodity-macro-sentiment";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useCommodityDetailMacroSentiment(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cmr-macro-sentiment", sym],
    queryFn: () => fetchCommodityDetailMacroSentiment(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
