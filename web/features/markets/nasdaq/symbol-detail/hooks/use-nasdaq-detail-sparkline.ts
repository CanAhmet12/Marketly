"use client";

import { useQuery } from "@tanstack/react-query";

import type { NasdaqSparklineRange } from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { fetchNasdaqDetailSparkline } from "@/features/markets/nasdaq/symbol-detail/lib/fetch-nasdaq-sparkline";
import { detailQueryOptions } from "@/features/markets/symbol-detail-core/lib/detail-query-options";

const REFETCH_MS = 60_000;

export function useNasdaqDetailSparkline(symbol: string, range: NasdaqSparklineRange = "1mo") {
  const sym = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ["nqx-sparkline", sym, range],
    queryFn: () => fetchNasdaqDetailSparkline(sym, range),
    enabled: sym.length >= 1,
    ...detailQueryOptions(REFETCH_MS),
  });
}
