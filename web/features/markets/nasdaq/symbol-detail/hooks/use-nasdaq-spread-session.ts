"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchNasdaqDetailSpreadSession } from "@/features/markets/nasdaq/symbol-detail/lib/fetch-nasdaq-spread-session";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 30_000;

export function useNasdaqDetailSpreadSession(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["nqx-spread-session", sym],
    queryFn: () => fetchNasdaqDetailSpreadSession(sym),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
