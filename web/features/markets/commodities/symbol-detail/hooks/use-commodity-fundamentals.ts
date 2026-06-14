"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCommodityDetailFundamentals } from "@/features/markets/commodities/symbol-detail/lib/fetch-commodity-fundamentals";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 300_000;

export function useCommodityDetailFundamentals(symbol: string, name?: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["cmr-fundamentals", sym, name ?? ""],
    queryFn: () => fetchCommodityDetailFundamentals(sym, name),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
