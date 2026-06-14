"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchForexDetailSpreadSession } from "@/features/markets/forex/symbol-detail/lib/fetch-forex-spread-session";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 30_000;

export function useForexDetailSpreadSession(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase().replace("/", "");

  return useQuery({
    queryKey: ["fx-spread-session", sym],
    queryFn: () => fetchForexDetailSpreadSession(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
