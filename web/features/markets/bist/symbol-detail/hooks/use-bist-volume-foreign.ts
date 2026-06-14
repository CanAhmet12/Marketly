"use client";

import { useQuery } from "@tanstack/react-query";

import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchBistDetailVolumeForeign } from "@/features/markets/bist/symbol-detail/lib/fetch-bist-volume-foreign";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 120_000;

export function useBistDetailVolumeForeign(symbol: string, changePct?: number) {
  const sym = normalizeBistSymbol(symbol);

  return useQuery({
    queryKey: ["bc-volume-foreign", sym, changePct ?? 0],
    queryFn: () => fetchBistDetailVolumeForeign(sym, changePct),
    enabled: sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
