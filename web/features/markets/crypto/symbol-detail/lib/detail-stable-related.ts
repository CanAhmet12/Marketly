import { filterCategory } from "@/features/markets/lib/live-category/live-category-shared";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import type { MarketAssetView } from "@/features/markets/types";

export type StableRelatedCard = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  spark: number[];
  href: string;
};

function initialOrder(assets: MarketAssetView[], excludeSym: string, limit: number): string[] {
  return [...assets]
    .filter((a) => a.symbol.trim().toUpperCase() !== excludeSym)
    .sort((a, b) => a.symbol.localeCompare(b.symbol))
    .slice(0, limit)
    .map((a) => a.symbol.trim().toUpperCase());
}

/** İlgili varlık kart sırasını dondur; yalnızca fiyat/değişim güncellenir. */
export function buildStableRelatedCards(
  liveAssets: readonly MarketAssetView[],
  excludeSym: string,
  limit: number,
  frozenOrder: string[] | null,
): { cards: StableRelatedCard[]; order: string[] } {
  const sym = excludeSym.trim().toUpperCase();
  const crypto = filterCategory(liveAssets, "crypto").filter((a) => a.symbol.trim().toUpperCase() !== sym);

  if (crypto.length === 0) {
    return { cards: [], order: [] };
  }

  const bySymbol = new Map(crypto.map((a) => [a.symbol.trim().toUpperCase(), a]));
  let order = frozenOrder?.length ? [...frozenOrder] : initialOrder(crypto, sym, limit);

  order = order.filter((s) => bySymbol.has(s));
  for (const s of initialOrder(crypto, sym, limit)) {
    if (order.length >= limit) break;
    if (!order.includes(s)) order.push(s);
  }

  const cards = order
    .map((s) => bySymbol.get(s))
    .filter((asset): asset is MarketAssetView => Boolean(asset))
    .map((a) => ({
      symbol: a.symbol,
      name: a.name,
      price: a.price,
      change: a.change_percent,
      spark: a.sparkline?.length ? a.sparkline : [a.price * 0.98, a.price],
      href: marketSymbolPath(a.symbol),
    }));

  return { cards, order };
}
