"use client";

import { useQuery } from "@tanstack/react-query";

import type { ForexSparklineRange } from "@/features/markets/forex/lib/forex-chart-types";
import { fetchForexDetailSparkline } from "@/features/markets/forex/symbol-detail/lib/fetch-forex-sparkline";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useForexDetailSparkline(symbol: string, range: ForexSparklineRange = "1mo") {
  const sym = symbol.trim().toUpperCase().replace("/", "");

  return useQuery({
    queryKey: ["fx-sparkline", sym, range],
    queryFn: () => fetchForexDetailSparkline(sym, range),
    enabled: sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
