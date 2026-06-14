"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchForexDetailCarrySwap } from "@/features/markets/forex/symbol-detail/lib/fetch-forex-carry-swap";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 300_000;

export function useForexDetailCarrySwap(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase().replace("/", "");

  return useQuery({
    queryKey: ["fx-carry-swap", sym],
    queryFn: () => fetchForexDetailCarrySwap(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
