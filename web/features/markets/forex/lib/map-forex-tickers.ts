import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import { pairLabel } from "@/features/markets/lib/live-category/live-category-shared";
import type { MarketAssetView } from "@/features/markets/types";

/** Major parite önceliği — ticker şeridinde sabit sıra */
const FX_TICKER_PRIORITY = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDTRY",
  "EURTRY",
  "AUDUSD",
  "USDCAD",
  "USDCHF",
  "EURJPY",
  "GBPJPY",
  "EURGBP",
  "DXY",
] as const;

export type ForexTickerItem = {
  id: string;
  symbol: string;
  pair: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
  href: string;
};

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().replace("/", "");
}

function priorityIndex(symbol: string): number {
  const key = normalizeSymbol(symbol);
  const idx = FX_TICKER_PRIORITY.indexOf(key as (typeof FX_TICKER_PRIORITY)[number]);
  return idx === -1 ? 999 : idx;
}

export function formatForexTickerPrice(price: number, symbol: string): string {
  const pair = pairLabel(symbol);
  if (pair.includes("JPY") && !pair.startsWith("JPY")) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (pair.includes("TRY") || price >= 10) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 5 });
  }
  return price.toLocaleString("en-US", { minimumSignificantDigits: 4, maximumSignificantDigits: 6 });
}

export function mapForexAssetsToTickers(assets: readonly MarketAssetView[]): ForexTickerItem[] {
  return [...assets]
    .sort((a, b) => {
      const pa = priorityIndex(a.symbol);
      const pb = priorityIndex(b.symbol);
      if (pa !== pb) return pa - pb;
      return Math.abs(b.change_percent) - Math.abs(a.change_percent);
    })
    .slice(0, 14)
    .map((a) => ({
      id: a.id,
      symbol: a.symbol,
      pair: pairLabel(a.symbol),
      name: a.name,
      price: formatForexTickerPrice(a.price, a.symbol),
      change: formatSignedChangePercent(a.change_percent),
      positive: a.change_percent > 0,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
    }));
}
