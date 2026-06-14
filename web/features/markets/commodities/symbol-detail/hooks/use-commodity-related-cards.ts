"use client";

import { useMemo, useRef } from "react";

import {
  buildCommodityRelatedCards,
  type CommodityRelatedCard,
} from "@/features/markets/commodities/symbol-detail/lib/commodity-detail-related";
import { filterCommodityAssets } from "@/features/markets/lib/live-category/live-category-shared";
import type { MarketAssetView } from "@/features/markets/types";

function cardsSignature(cards: CommodityRelatedCard[]): string {
  return cards.map((c) => `${c.symbol}:${c.price}:${c.change}`).join("|");
}

export function useCommodityRelatedCards(
  assets: readonly MarketAssetView[],
  symbol: string,
  limit: number,
): CommodityRelatedCard[] {
  const sym = symbol.trim().toUpperCase();
  const pool = useMemo(() => filterCommodityAssets(assets), [assets]);
  const orderRef = useRef<string[] | null>(null);
  const cacheRef = useRef<CommodityRelatedCard[]>([]);
  const sigRef = useRef("");

  return useMemo(() => {
    const { cards: stable, order } = buildCommodityRelatedCards(pool, sym, limit, orderRef.current);
    if (order.length > 0) orderRef.current = order;

    const sig = cardsSignature(stable);
    if (sig === sigRef.current && cacheRef.current.length > 0) return cacheRef.current;
    sigRef.current = sig;
    cacheRef.current = stable;
    return stable;
  }, [limit, pool, sym]);
}
