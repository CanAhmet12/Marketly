"use client";

import { useMemo, useRef } from "react";

import {
  buildStableRelatedCards,
  type StableRelatedCard,
} from "@/features/markets/crypto/symbol-detail/lib/detail-stable-related";
import { useStableMarketAssets } from "@/features/markets/crypto/symbol-detail/hooks/use-stable-market-assets";
import { marketSymbolPath } from "@/features/markets/markets-routes";

const FALLBACK_SYMBOLS = ["ETH", "SOL", "BNB", "DOT", "LTC", "ADA", "XRP", "AVAX"];

function cardsSignature(cards: StableRelatedCard[]): string {
  return cards.map((c) => `${c.symbol}:${c.price}:${c.change}`).join("|");
}

export function useStableRelatedCards(symbol: string, limit: number): StableRelatedCard[] {
  const sym = symbol.trim().toUpperCase();
  const assets = useStableMarketAssets();
  const orderRef = useRef<string[] | null>(null);
  const cacheRef = useRef<StableRelatedCard[]>([]);
  const sigRef = useRef("");

  return useMemo(() => {
    const { cards: stable, order } = buildStableRelatedCards(assets, sym, limit, orderRef.current);
    if (order.length > 0) orderRef.current = order;

    let next = stable;
    if (stable.length < 4) {
      next = FALLBACK_SYMBOLS.filter((s) => s !== sym)
        .slice(0, limit)
        .map((s, i) => ({
          symbol: s,
          name: s,
          price: 1000 + i * 500,
          change: 0.5 + i * 0.3,
          spark: [100, 102, 101, 104, 103],
          href: marketSymbolPath(s),
        }));
    }

    const sig = cardsSignature(next);
    if (sig === sigRef.current && cacheRef.current.length > 0) return cacheRef.current;
    sigRef.current = sig;
    cacheRef.current = next;
    return next;
  }, [assets, limit, sym]);
}
