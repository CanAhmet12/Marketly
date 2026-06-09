/** Sağ rail — modern fintech renk paleti ve sembol öncelikleri */

export const RAIL_CATEGORY_COLORS = {
  crypto: "#FFB020",
  stocks: "#5B8DEF",
  forex: "#2DD4A8",
  commodity: "#FF8C42",
  index: "#A78BFA",
} as const;

export const RAIL_ACCENT_COLORS = {
  signals: "#FFB020",
  news: "#5B8DEF",
  watchlist: "#22D3EE",
  creators: "#A78BFA",
  discussions: "#2DD4A8",
  interests: "#38BDF8",
  primary: "var(--color-primary)",
} as const;

/** Kategori başına öncelikli semboller — önemli varlıklar önce listelenir */
export const RAIL_PRIORITY_SYMBOLS: Record<string, readonly string[]> = {
  crypto: ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX"],
  stocks: ["THYAO", "GARAN", "AKBNK", "SISE", "EREGL", "BIMAS", "KCHOL", "ASELS"],
  forex: ["USDTRY", "EURUSD", "GBPUSD", "EURTRY", "USDJPY", "XAUUSD", "DXY"],
  commodity: ["GOLD", "XAUUSD", "OIL", "BRENT", "SILVER", "XAGUSD", "COPPER"],
  index: ["XU100", "BIST100", "SPX", "NDX", "DJI", "DAX", "FTSE"],
};

export function railSymbolPriority(symbol: string, category: string): number {
  const list = RAIL_PRIORITY_SYMBOLS[category];
  if (!list) return 999;
  const idx = list.indexOf(symbol.toUpperCase());
  return idx >= 0 ? idx : 999;
}

export const QUICK_FILTER_ICONS: Record<string, string> = {
  crypto: "₿",
  stocks: "◈",
  forex: "¤",
  signals: "⚡",
  news: "◉",
};

/** İzleme listesi boşken önerilen semboller */
export const WATCHLIST_SUGGESTIONS = [
  { symbol: "BTC", color: RAIL_CATEGORY_COLORS.crypto },
  { symbol: "ETH", color: RAIL_CATEGORY_COLORS.crypto },
  { symbol: "THYAO", color: RAIL_CATEGORY_COLORS.stocks },
  { symbol: "XU100", color: RAIL_CATEGORY_COLORS.index },
] as const;

/** Sembolden kategori rengi tahmini */
export function inferSymbolRailColor(symbol: string): string {
  const cat = inferSymbolCategory(symbol);
  if (cat) return RAIL_CATEGORY_COLORS[cat];
  return RAIL_ACCENT_COLORS.watchlist;
}

export function inferSymbolCategory(symbol: string): keyof typeof RAIL_CATEGORY_COLORS | null {
  const s = symbol.toUpperCase().replace(/^#/, "").trim();
  for (const [cat, syms] of Object.entries(RAIL_PRIORITY_SYMBOLS)) {
    if (syms.includes(s)) return cat as keyof typeof RAIL_CATEGORY_COLORS;
  }
  if (["BTC", "ETH", "SOL", "BNB", "XRP", "ADA"].includes(s)) return "crypto";
  if (s.endsWith("TRY") || s.includes("USD") || s.includes("EUR") || s === "DXY") return "forex";
  return null;
}
