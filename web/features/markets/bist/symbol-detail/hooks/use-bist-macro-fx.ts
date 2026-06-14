"use client";

import { useQuery } from "@tanstack/react-query";

import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchBistDetailMacroFx } from "@/features/markets/bist/symbol-detail/lib/fetch-bist-macro-fx";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 120_000;

export function useBistDetailMacroFx(symbol: string) {
  const sym = normalizeBistSymbol(symbol);

  return useQuery({
    queryKey: ["bc-macro-fx", sym],
    queryFn: () => fetchBistDetailMacroFx(sym),
    enabled: sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
