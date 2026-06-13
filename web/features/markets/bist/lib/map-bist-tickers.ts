import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { MarketAssetView } from "@/features/markets/types";

const BIST_TICKER_PRIORITY = [
  "XU100",
  "BIST100",
  "XU030",
  "BIST30",
  "XUBANK",
  "THYAO",
  "GARAN",
  "ASELS",
  "AKBNK",
  "ISCTR",
  "YKBNK",
  "KCHOL",
  "EREGL",
  "TUPRS",
  "BIMAS",
  "SAHOL",
] as const;

export type BistTickerItem = {
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
  return symbol.toUpperCase().replace(".IS", "");
}

function priorityIndex(symbol: string): number {
  const key = normalizeSymbol(symbol);
  const idx = BIST_TICKER_PRIORITY.indexOf(key as (typeof BIST_TICKER_PRIORITY)[number]);
  return idx === -1 ? 999 : idx;
}

export function formatBistTickerPrice(price: number, symbol: string): string {
  const key = normalizeSymbol(symbol);
  if (key.startsWith("XU") || key.startsWith("BIST")) {
    return price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1000) {
    return price.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
  }
  return price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function mapBistAssetsToTickers(assets: readonly MarketAssetView[]): BistTickerItem[] {
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
      label: normalizeSymbol(a.symbol),
      name: a.name,
      price: formatBistTickerPrice(a.price, a.symbol),
      change: formatSignedChangePercent(a.change_percent),
      positive: a.change_percent > 0,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
    }));
}
