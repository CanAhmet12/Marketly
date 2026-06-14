import { isBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import { inferMarketAssetCategory } from "@/lib/market-category";

/** Piyasalar hub — `/markets` varsayılan redirect hedefi. */
export const MARKETS_HUB_PATH = "/markets/category/crypto";

export function marketsCategoryPath(slug: string): string {
  return `/markets/category/${encodeURIComponent(slug)}`;
}

/** Varlık detay — kripto dahil `/markets/[symbol]`. */
export function marketSymbolPath(symbol: string): string {
  return `/markets/${encodeURIComponent(symbol.trim())}`;
}

export function marketAssetSignalsPath(symbol: string): string {
  return `/signals?asset=${encodeURIComponent(symbol.trim())}`;
}

/** Kripto sembol mü — route ayrımı için. */
export function isCryptoMarketSymbol(symbol: string): boolean {
  return inferMarketAssetCategory(symbol.trim()) === "crypto";
}

/** Emtia sembol mü — route ayrımı için. */
export function isCommodityMarketSymbol(symbol: string): boolean {
  return inferMarketAssetCategory(symbol.trim()) === "commodity";
}

/** Kategori hub yolu — detay breadcrumb için. */
export function marketsHubPathForCategory(category: string): string {
  switch (category) {
    case "commodity":
      return marketsCategoryPath("commodities");
    case "forex":
      return marketsCategoryPath("forex");
    case "bist":
      return marketsCategoryPath("bist");
    case "stocks":
    case "index":
      return marketsCategoryPath("nasdaq");
    case "crypto":
    default:
      return marketsCategoryPath("crypto");
  }
}
