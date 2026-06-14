"use client";

import { fetchDetailSentimentOnchain } from "@/features/markets/crypto/symbol-detail/lib/fetch-sentiment-onchain";
import { detailQueryOptions } from "@/features/markets/crypto/symbol-detail/lib/detail-query-options";
import { useDetailQueryData } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-query-data";

const REFETCH_MS = 300_000;

export function useDetailSentimentOnchain(symbol: string, enabled = true) {
  const sym = symbol.trim().toUpperCase();

  return useDetailQueryData({
    queryKey: ["cdr-sentiment-onchain", sym],
    queryFn: () => fetchDetailSentimentOnchain(sym),
    enabled: enabled && sym.length >= 2,
    ...detailQueryOptions(REFETCH_MS),
  });
}
