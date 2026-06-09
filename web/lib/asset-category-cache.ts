import type { MarketAssetCategory } from "@/features/markets/types";

const cache = new Map<string, MarketAssetCategory>();

const HARDCODED: Record<string, MarketAssetCategory> = {
  BTC: "crypto",
  ETH: "crypto",
  SOL: "crypto",
  XU100: "index",
  NDX: "index",
  SPX: "index",
  THYAO: "stocks",
  ASELS: "stocks",
  GARAN: "stocks",
  AAPL: "stocks",
  USDTRY: "forex",
  XAUUSD: "commodity",
};

function normalizeCategory(raw: string | null | undefined): MarketAssetCategory | null {
  if (!raw) return null;
  const c = raw.toLowerCase();
  if (c === "commodities" || c === "commodity") return "commodity";
  if (c === "stock" || c === "stocks" || c === "equity") return "stocks";
  if (c === "index" || c === "indices") return "index";
  if (c === "forex" || c === "fx") return "forex";
  if (c === "crypto" || c === "cryptocurrency") return "crypto";
  if (["crypto", "stocks", "forex", "commodity", "index"].includes(c)) {
    return c as MarketAssetCategory;
  }
  return null;
}

export function setAssetCategoryCache(entries: ReadonlyArray<{ symbol: string; category: string }>): void {
  for (const e of entries) {
    const norm = normalizeCategory(e.category);
    if (!norm) continue;
    cache.set(e.symbol.trim().toUpperCase(), norm);
  }
}

export function inferMarketAssetCategory(symbol: string): MarketAssetCategory {
  const key = symbol.trim().toUpperCase();
  return cache.get(key) ?? HARDCODED[key] ?? "crypto";
}
