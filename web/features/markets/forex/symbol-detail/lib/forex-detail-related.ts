import {
  filterForexAssets,
  pairLabel,
} from "@/features/markets/lib/live-category/live-category-shared";
import { relatedPairGroup } from "@/features/markets/forex/lib/forex-symbol-meta";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import type { MarketAssetView } from "@/features/markets/types";

export type ForexRelatedCard = {
  symbol: string;
  pair: string;
  name: string;
  price: number;
  change: number;
  spark: number[];
  href: string;
};

function initialOrder(assets: MarketAssetView[], excludeSym: string, limit: number): string[] {
  const preferred = relatedPairGroup(excludeSym);
  const pool = filterForexAssets(assets).filter((a) => a.symbol.trim().toUpperCase() !== excludeSym);
  const bySymbol = new Map(pool.map((a) => [a.symbol.trim().toUpperCase(), a]));

  const order: string[] = [];
  for (const sym of preferred) {
    if (bySymbol.has(sym) && order.length < limit) order.push(sym);
  }

  for (const a of pool.sort((x, y) => Math.abs(y.change_percent) - Math.abs(x.change_percent))) {
    const sym = a.symbol.trim().toUpperCase();
    if (order.length >= limit) break;
    if (!order.includes(sym)) order.push(sym);
  }

  return order;
}

export function buildForexRelatedCards(
  liveAssets: readonly MarketAssetView[],
  excludeSym: string,
  limit: number,
  frozenOrder: string[] | null,
): { cards: ForexRelatedCard[]; order: string[] } {
  const sym = excludeSym.trim().toUpperCase();
  const pool = filterForexAssets(liveAssets).filter((a) => a.symbol.trim().toUpperCase() !== sym);

  if (pool.length === 0) {
    return { cards: [], order: [] };
  }

  const bySymbol = new Map(pool.map((a) => [a.symbol.trim().toUpperCase(), a]));
  let order = frozenOrder?.length ? [...frozenOrder] : initialOrder(pool, sym, limit);

  order = order.filter((s) => bySymbol.has(s));
  for (const s of initialOrder(pool, sym, limit)) {
    if (order.length >= limit) break;
    if (!order.includes(s)) order.push(s);
  }

  const cards = order
    .map((s) => bySymbol.get(s))
    .filter((asset): asset is MarketAssetView => Boolean(asset))
    .map((a) => ({
      symbol: a.symbol,
      pair: pairLabel(a.symbol),
      name: a.name,
      price: a.price,
      change: a.change_percent,
      spark: a.sparkline?.length ? a.sparkline : [a.price * 0.9998, a.price],
      href: marketSymbolPath(a.symbol),
    }));

  return { cards, order };
}
