"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchForexDetailMacroSentiment } from "@/features/markets/forex/symbol-detail/lib/fetch-forex-macro-sentiment";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useForexDetailMacroSentiment(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase().replace("/", "");

  return useQuery({
    queryKey: ["fx-macro-sentiment", sym],
    queryFn: () => fetchForexDetailMacroSentiment(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
