"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDetailKlines } from "@/features/markets/crypto/symbol-detail/lib/fetch-klines";
import { detailQueryOptions } from "@/features/markets/crypto/symbol-detail/lib/detail-query-options";
import type { DetailChartTimeframe } from "@/features/markets/crypto/symbol-detail/lib/types";
import { DETAIL_KLINE_CONFIG } from "@/features/markets/crypto/symbol-detail/lib/types";

export function useDetailKlines(symbol: string, timeframe: DetailChartTimeframe) {
  const sym = symbol.trim().toUpperCase();
  const config = DETAIL_KLINE_CONFIG[timeframe];

  return useQuery({
    queryKey: ["cdr-klines", sym, timeframe],
    queryFn: () => fetchDetailKlines(sym, timeframe),
    enabled: sym.length >= 2,
    ...detailQueryOptions(config.refetchMs),
  });
}
