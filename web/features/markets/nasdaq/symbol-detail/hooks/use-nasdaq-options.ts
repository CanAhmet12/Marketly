"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchNasdaqDetailOptions } from "@/features/markets/nasdaq/symbol-detail/lib/fetch-nasdaq-options";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useNasdaqDetailOptions(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["nqx-options", sym],
    queryFn: () => fetchNasdaqDetailOptions(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
