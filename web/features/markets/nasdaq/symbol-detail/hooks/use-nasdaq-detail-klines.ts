"use client";

import { useQuery } from "@tanstack/react-query";

import type { NasdaqChartTimeframe } from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { NASDAQ_KLINE_CONFIG } from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { fetchNasdaqDetailKlines } from "@/features/markets/nasdaq/symbol-detail/lib/fetch-nasdaq-klines";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

export function useNasdaqDetailKlines(symbol: string, timeframe: NasdaqChartTimeframe) {
  const sym = symbol.trim().toUpperCase();
  const config = NASDAQ_KLINE_CONFIG[timeframe];

  return useQuery({
    queryKey: ["nqx-klines", sym, timeframe],
    queryFn: () => fetchNasdaqDetailKlines(sym, timeframe),
    enabled: sym.length >= 1,
    ...detailQueryOptions(config.refetchMs),
  });
}
