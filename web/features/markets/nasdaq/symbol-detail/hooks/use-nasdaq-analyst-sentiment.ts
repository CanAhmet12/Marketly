"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchNasdaqDetailAnalystSentiment } from "@/features/markets/nasdaq/symbol-detail/lib/fetch-nasdaq-analyst-sentiment";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useNasdaqDetailAnalystSentiment(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["nqx-analyst-sentiment", sym],
    queryFn: () => fetchNasdaqDetailAnalystSentiment(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
