"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchNasdaqDetailFundamentals } from "@/features/markets/nasdaq/symbol-detail/lib/fetch-nasdaq-fundamentals";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 300_000;

export function useNasdaqDetailFundamentals(symbol: string, name?: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["nqx-fundamentals", sym, name ?? ""],
    queryFn: () => fetchNasdaqDetailFundamentals(sym, name),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
