"use client";

import { useQuery } from "@tanstack/react-query";

import type { CommodityChartTimeframe } from "@/features/markets/commodities/lib/commodity-chart-types";
import { COMMODITY_KLINE_CONFIG } from "@/features/markets/commodities/lib/commodity-chart-types";
import { fetchCommodityDetailKlines } from "@/features/markets/commodities/symbol-detail/lib/fetch-commodity-klines";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

export function useCommodityDetailKlines(symbol: string, timeframe: CommodityChartTimeframe) {
  const sym = symbol.trim().toUpperCase();
  const config = COMMODITY_KLINE_CONFIG[timeframe];

  return useQuery({
    queryKey: ["cmr-klines", sym, timeframe],
    queryFn: () => fetchCommodityDetailKlines(sym, timeframe),
    enabled: sym.length >= 2,
    ...detailQueryOptions(config.refetchMs),
  });
}
