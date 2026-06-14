import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import { filterCategory } from "@/features/markets/lib/live-category/live-category-shared";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import type { MarketAssetView } from "@/features/markets/types";

export type StableTickerItem = {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
  href: string;
};

function formatTickerPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("tr-TR", { maximumFractionDigits: 4 });
  return price.toLocaleString("tr-TR", { maximumFractionDigits: 6 });
}

function initialOrder(assets: MarketAssetView[]): string[] {
  return [...assets]
    .sort((a, b) => a.symbol.localeCompare(b.symbol))
    .slice(0, 16)
    .map((a) => a.symbol.trim().toUpperCase());
}

/** Canlı fiyat günceller; sembol sırasını sabit tutar (marquee sıfırlanmasın). */
export function buildStableCryptoTickers(
  assets: MarketAssetView[],
  frozenOrder: string[] | null,
): { tickers: StableTickerItem[]; order: string[] } {
  const pool = filterCategory(assets, "crypto");
  const source = pool.length > 0 ? pool : assets;
  if (source.length === 0) return { tickers: [], order: [] };

  const bySymbol = new Map(source.map((a) => [a.symbol.trim().toUpperCase(), a]));
  let order = frozenOrder?.length ? [...frozenOrder] : initialOrder(source);

  order = order.filter((sym) => bySymbol.has(sym));
  for (const sym of initialOrder(source)) {
    if (order.length >= 16) break;
    if (!order.includes(sym)) order.push(sym);
  }

  const tickers = order
    .map((sym) => bySymbol.get(sym))
    .filter((asset): asset is MarketAssetView => Boolean(asset))
    .map((a) => ({
      id: a.id,
      symbol: a.symbol,
      name: a.name,
      price: formatTickerPrice(a.price),
      change: formatSignedChangePercent(a.change_percent),
      positive: a.change_percent > 0,
      href: marketSymbolPath(a.symbol),
    }));

  return { tickers, order };
}
