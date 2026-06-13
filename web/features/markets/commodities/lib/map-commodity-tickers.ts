import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { MarketAssetView } from "@/features/markets/types";

/** Ticker şeridinde sabit emtia önceliği */
const COMMODITY_TICKER_PRIORITY = [
  "XAU",
  "XAUUSD",
  "XAG",
  "XAGUSD",
  "WTI",
  "BRENT",
  "NGAS",
  "NATGAS",
  "COPPER",
  "WHEAT",
  "CORN",
  "SOYBEAN",
  "PLAT",
  "PALL",
] as const;

const COMMODITY_LABELS: Record<string, string> = {
  XAU: "ALTIN",
  XAUUSD: "ALTIN",
  XAG: "GÜMÜŞ",
  XAGUSD: "GÜMÜŞ",
  WTI: "PETROL",
  BRENT: "BRENT",
  NGAS: "GAZ",
  NATGAS: "GAZ",
  COPPER: "BAKIR",
  WHEAT: "BUĞDAY",
  CORN: "MISIR",
  SOYBEAN: "SOYA",
  PLAT: "PLATİN",
  PALL: "PALADYUM",
};

export type CommodityTickerItem = {
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
  const idx = COMMODITY_TICKER_PRIORITY.indexOf(key as (typeof COMMODITY_TICKER_PRIORITY)[number]);
  return idx === -1 ? 999 : idx;
}

export function commodityDisplayLabel(symbol: string, name?: string): string {
  const key = normalizeSymbol(symbol);
  return COMMODITY_LABELS[key] ?? name ?? key;
}

export function formatCommodityTickerPrice(price: number, symbol: string): string {
  const key = normalizeSymbol(symbol);
  if (key.includes("XAU") || key.includes("XAG") || key.includes("PLAT") || key.includes("PALL")) {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (key.includes("WTI") || key.includes("BRENT") || key.includes("NG") || key.includes("GAS")) {
    return `$${price.toFixed(2)}`;
  }
  if (price >= 100) {
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(2)}`;
}

export function mapCommodityAssetsToTickers(assets: readonly MarketAssetView[]): CommodityTickerItem[] {
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
      label: commodityDisplayLabel(a.symbol, a.name),
      name: a.name,
      price: formatCommodityTickerPrice(a.price, a.symbol),
      change: formatSignedChangePercent(a.change_percent),
      positive: a.change_percent > 0,
      href: `/markets/${encodeURIComponent(a.symbol)}`,
    }));
}
