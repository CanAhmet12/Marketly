"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchForexDetailMacroRates } from "@/features/markets/forex/symbol-detail/lib/fetch-forex-macro-rates";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 300_000;

export function useForexDetailMacroRates(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase().replace("/", "");

  return useQuery({
    queryKey: ["fx-macro-rates", sym],
    queryFn: () => fetchForexDetailMacroRates(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
