"use client";

import { useMemo, useRef } from "react";

import { buildNasdaqRelatedCards } from "@/features/markets/nasdaq/symbol-detail/lib/nasdaq-detail-related";
import type { MarketAssetView } from "@/features/markets/types";

export function useNasdaqRelatedCards(
  assets: readonly MarketAssetView[],
  symbol: string,
  limit = 6,
) {
  const orderRef = useRef<string[] | null>(null);

  return useMemo(() => {
    const { cards, order } = buildNasdaqRelatedCards(assets, symbol, limit, orderRef.current);
    if (order.length > 0) orderRef.current = order;
    return cards;
  }, [assets, symbol, limit]);
}
