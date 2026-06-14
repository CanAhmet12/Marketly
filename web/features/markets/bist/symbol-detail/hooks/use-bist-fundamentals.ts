"use client";

import { useQuery } from "@tanstack/react-query";

import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchBistDetailFundamentals } from "@/features/markets/bist/symbol-detail/lib/fetch-bist-fundamentals";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 300_000;

export function useBistDetailFundamentals(symbol: string, name?: string, enabled = true) {
  const sym = normalizeBistSymbol(symbol);

  return useQuery({
    queryKey: ["bc-fundamentals", sym, name ?? ""],
    queryFn: () => fetchBistDetailFundamentals(sym, name),
    enabled: enabled && sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
