"use client";

import { useQuery } from "@tanstack/react-query";

import type { BistChartTimeframe } from "@/features/markets/bist/lib/bist-chart-types";
import { BIST_KLINE_CONFIG } from "@/features/markets/bist/lib/bist-chart-types";
import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchBistDetailKlines } from "@/features/markets/bist/symbol-detail/lib/fetch-bist-klines";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

export function useBistDetailKlines(symbol: string, timeframe: BistChartTimeframe) {
  const sym = normalizeBistSymbol(symbol);
  const config = BIST_KLINE_CONFIG[timeframe];

  return useQuery({
    queryKey: ["bc-klines", sym, timeframe],
    queryFn: () => fetchBistDetailKlines(sym, timeframe),
    enabled: sym.length >= 1,
    ...detailQueryOptions(config.refetchMs),
  });
}
