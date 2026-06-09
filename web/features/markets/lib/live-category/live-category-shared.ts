import type { MarketAssetView } from "@/features/markets/types";
import { sparklineOrResolved } from "@/features/markets/lib/resolve-sparkline";

export function trendFromChange(cp: number): "up" | "down" | "flat" {
  if (cp > 0) return "up";
  if (cp < 0) return "down";
  return "flat";
}

export function fmtPrice(n: number): string {
  if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { minimumSignificantDigits: 2, maximumSignificantDigits: 4 });
}

export function fmtPct(n: number): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function sparkOrFlat(asset: MarketAssetView): number[] {
  const series = sparklineOrResolved(asset);
  return series.length > 1 ? series : [asset.price, asset.price];
}

export function sortByChangeDesc(assets: readonly MarketAssetView[]): MarketAssetView[] {
  return [...assets].sort((a, b) => b.change_percent - a.change_percent);
}

export function sortByChangeAsc(assets: readonly MarketAssetView[]): MarketAssetView[] {
  return [...assets].sort((a, b) => a.change_percent - b.change_percent);
}

export function avgChange(assets: readonly MarketAssetView[]): number {
  if (!assets.length) return 0;
  return assets.reduce((s, a) => s + a.change_percent, 0) / assets.length;
}

export function findAsset(assets: readonly MarketAssetView[], symbol: string): MarketAssetView | undefined {
  const key = symbol.trim().toUpperCase();
  return assets.find((a) => a.symbol.toUpperCase() === key);
}

export function filterCategory(assets: readonly MarketAssetView[], category: MarketAssetView["category"]): MarketAssetView[] {
  return assets.filter((a) => a.category === category);
}

/** BIST — sembol kümesi (exchange alanı yok; geçici ayrım). */
const BIST_SYMBOLS = new Set([
  "XU100", "XU030", "BIST100", "BIST30", "THYAO", "GARAN", "ASELS", "BIMAS", "SAHOL", "KCHOL",
  "EREGL", "SISE", "TUPRS", "YKBNK", "AKBNK", "ISCTR", "PGSUS", "TCELL", "FROTO", "TOASO",
  "HALKB", "VAKBN", "PETKM", "MGROS", "ARCLK", "TTKOM", "DOHOL", "ENKAI",
]);

/** NASDAQ / US — sembol kümesi */
const NASDAQ_SYMBOLS = new Set([
  "NDX", "SPX", "QQQ", "COMP", "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "GOOG", "META", "TSLA",
  "AMD", "NFLX", "INTC", "AVGO", "COST", "ADBE", "CRM", "PEP", "CSCO", "QCOM", "AMAT", "MU",
]);

export function filterBistAssets(assets: readonly MarketAssetView[]): MarketAssetView[] {
  return assets.filter((a) => {
    const sym = a.symbol.toUpperCase();
    if (BIST_SYMBOLS.has(sym)) return true;
    if (a.category === "index" && (sym.includes("XU") || sym.includes("BIST"))) return true;
    return a.category === "stocks" && sym.endsWith(".IS");
  });
}

export function filterNasdaqAssets(assets: readonly MarketAssetView[]): MarketAssetView[] {
  return assets.filter((a) => {
    const sym = a.symbol.toUpperCase();
    if (BIST_SYMBOLS.has(sym)) return false;
    if (NASDAQ_SYMBOLS.has(sym)) return true;
    if (a.category === "index" && (sym === "NDX" || sym === "SPX" || sym === "QQQ")) return true;
    return a.category === "stocks" && /^[A-Z]{1,5}$/.test(sym) && !sym.endsWith(".IS");
  });
}

/** Forex sembolleri — DB'de forex kategorisi veya bilinen pair kodları */
const FOREX_SYMBOLS = new Set([
  "EURUSD", "GBPUSD", "USDJPY", "USDTRY", "EURTRY", "GBPJPY", "AUDUSD", "USDCAD", "USDCHF", "DXY",
]);

export function filterForexAssets(assets: readonly MarketAssetView[]): MarketAssetView[] {
  return assets.filter((a) => {
    const sym = a.symbol.toUpperCase();
    return a.category === "forex" || FOREX_SYMBOLS.has(sym);
  });
}

/** Emtia sembolleri */
const COMMODITY_SYMBOLS = new Set([
  "XAU", "XAG", "XAUUSD", "XAGUSD", "WTI", "BRENT", "NGAS", "NATGAS", "COPPER", "WHEAT", "CORN",
]);

export function filterCommodityAssets(assets: readonly MarketAssetView[]): MarketAssetView[] {
  return assets.filter((a) => {
    const sym = a.symbol.toUpperCase();
    return a.category === "commodity" || COMMODITY_SYMBOLS.has(sym);
  });
}

export function pairLabel(symbol: string): string {
  const s = symbol.toUpperCase();
  if (s.length === 6 && !s.includes("/")) return `${s.slice(0, 3)}/${s.slice(3)}`;
  return s;
}
