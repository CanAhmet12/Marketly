"use client";

import { useQuery } from "@tanstack/react-query";

import type { ForexChartTimeframe } from "@/features/markets/forex/lib/forex-chart-types";
import { FOREX_KLINE_CONFIG } from "@/features/markets/forex/lib/forex-chart-types";
import { fetchForexDetailKlines } from "@/features/markets/forex/symbol-detail/lib/fetch-forex-klines";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

export function useForexDetailKlines(symbol: string, timeframe: ForexChartTimeframe) {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const config = FOREX_KLINE_CONFIG[timeframe];

  return useQuery({
    queryKey: ["fx-klines", sym, timeframe],
    queryFn: () => fetchForexDetailKlines(sym, timeframe),
    enabled: sym.length >= 1,
    ...detailQueryOptions(config.refetchMs),
  });
}
