import type { MarketAssetCategory } from "@/features/markets/types";

const cache = new Map<string, MarketAssetCategory>();

const CRYPTO_SYMBOLS = new Set([
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "XRP",
  "DOGE",
  "ADA",
  "AVAX",
  "DOT",
  "MATIC",
  "LINK",
  "UNI",
  "LTC",
  "BCH",
  "ATOM",
  "NEAR",
  "APT",
  "ARB",
  "OP",
  "SHIB",
  "PEPE",
  "TRX",
  "USDT",
  "USDC",
]);

const HARDCODED: Record<string, MarketAssetCategory> = {
  BTC: "crypto",
  ETH: "crypto",
  SOL: "crypto",
  BNB: "crypto",
  XRP: "crypto",
  XU100: "index",
  XU030: "index",
  NDX: "index",
  SPX: "index",
  DJI: "index",
  THYAO: "stocks",
  ASELS: "stocks",
  GARAN: "stocks",
  BIMAS: "stocks",
  SISE: "stocks",
  EREGL: "stocks",
  KCHOL: "stocks",
  AKBNK: "stocks",
  AAPL: "stocks",
  NVDA: "stocks",
  TSLA: "stocks",
  USDTRY: "forex",
  EURUSD: "forex",
  GBPUSD: "forex",
  XAUUSD: "commodity",
  XAGUSD: "commodity",
};

export function normalizeAssetCategory(raw: string | null | undefined): MarketAssetCategory | null {
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

function inferFromSymbol(key: string): MarketAssetCategory {
  if (CRYPTO_SYMBOLS.has(key) || /^[A-Z]{2,5}(USDT|USDC|USD|TRY|EUR)$/.test(key)) {
    return "crypto";
  }

  if (/XAU|XAG|GOLD|SILVER|WTI|BRENT|XPT|XPD|OIL/.test(key)) {
    return "commodity";
  }

  if (/^XU\d+|^BIST|^SPX$|^NDX$|^DJI$|^FTSE|^DAX|^NI225|^NIKKEI/i.test(key)) {
    return "index";
  }

  if (key.includes("/")) {
    return "forex";
  }

  if (/^[A-Z]{6}$/.test(key) && !CRYPTO_SYMBOLS.has(key.slice(0, 3))) {
    return "forex";
  }

  if (/\.IS$/.test(key) || /^[A-Z]{4,6}$/.test(key)) {
    return "stocks";
  }

  if (/^[A-Z]{1,5}$/.test(key)) {
    return "stocks";
  }

  return "index";
}

export function setAssetCategoryCache(entries: ReadonlyArray<{ symbol: string; category: string }>): void {
  for (const e of entries) {
    const norm = normalizeAssetCategory(e.category);
    if (!norm) continue;
    cache.set(e.symbol.trim().toUpperCase(), norm);
  }
}

export function inferMarketAssetCategory(symbol: string): MarketAssetCategory {
  const key = symbol.trim().toUpperCase();
  return cache.get(key) ?? HARDCODED[key] ?? inferFromSymbol(key);
}
