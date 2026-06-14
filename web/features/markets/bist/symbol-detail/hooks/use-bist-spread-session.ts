"use client";

import { useQuery } from "@tanstack/react-query";

import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchBistDetailSpreadSession } from "@/features/markets/bist/symbol-detail/lib/fetch-bist-spread-session";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useBistDetailSpreadSession(symbol: string) {
  const sym = normalizeBistSymbol(symbol);

  return useQuery({
    queryKey: ["bc-spread-session", sym],
    queryFn: () => fetchBistDetailSpreadSession(sym),
    enabled: sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
