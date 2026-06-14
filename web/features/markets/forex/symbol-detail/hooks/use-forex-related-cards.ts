"use client";

import { useMemo, useRef } from "react";

import { buildForexRelatedCards } from "@/features/markets/forex/symbol-detail/lib/forex-detail-related";
import type { MarketAssetView } from "@/features/markets/types";

export function useForexRelatedCards(
  assets: readonly MarketAssetView[],
  symbol: string,
  limit = 6,
) {
  const orderRef = useRef<string[] | null>(null);
  const sym = symbol.trim().toUpperCase();

  return useMemo(() => {
    const { cards, order } = buildForexRelatedCards(assets, sym, limit, orderRef.current);
    if (order.length > 0) orderRef.current = order;
    return cards;
  }, [assets, sym, limit]);
}
