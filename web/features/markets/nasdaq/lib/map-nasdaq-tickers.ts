import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { MarketAssetView } from "@/features/markets/types";

const NASDAQ_TICKER_PRIORITY = [
  "NDX",
  "QQQ",
  "COMP",
  "SPX",
  "NVDA",
  "AAPL",
  "MSFT",
  "AMZN",
  "GOOGL",
  "GOOG",
  "META",
  "TSLA",
  "AMD",
  "AVGO",
  "NFLX",
  "INTC",
] as const;

export type NasdaqTickerItem = {
  id: string;
  symbol: string;
  label: string;
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
  const idx = NASDAQ_TICKER_PRIORITY.indexOf(key as (typeof NASDAQ_TICKER_PRIORITY)[number]);
  return idx === -1 ? 999 : idx;
}

export function formatNasdaqTickerPrice(price: number, symbol: string): string {
  const key = normalizeSymbol(symbol);
  if (key === "VIX") return price.toFixed(2);
  if (price >= 1000) {
    return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return `$${price.toFixed(2)}`;
}

export function mapNasdaqAssetsToTickers(assets: readonly MarketAssetView[]): NasdaqTickerItem[] {
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
      label: a.symbol.toUpperCase(),
      name: a.name,
      price: formatNasdaqTickerPrice(a.price, a.symbol),
      change: formatSignedChangePercent(a.change_percent),
      positive: a.change_percent > 0,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
    }));
}
