"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchForexDetailCrossPair } from "@/features/markets/forex/symbol-detail/lib/fetch-forex-cross-pair";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useForexDetailCrossPair(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase().replace("/", "");

  return useQuery({
    queryKey: ["fx-cross-pair", sym],
    queryFn: () => fetchForexDetailCrossPair(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
