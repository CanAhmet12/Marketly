import { inferMarketAssetCategory } from "@/lib/market-category";

const INDEX_SYMBOLS = new Set(["NDX", "SPX", "QQQ", "COMP"]);

const YAHOO_INDEX_TICKERS: Record<string, string> = {
  NDX: "^NDX",
  SPX: "^GSPC",
  COMP: "^IXIC",
  QQQ: "QQQ",
};

const SECTOR_BY_SYMBOL: Record<string, string> = {
  AAPL: "technology",
  MSFT: "technology",
  NVDA: "semiconductor",
  AMD: "semiconductor",
  AVGO: "semiconductor",
  INTC: "semiconductor",
  QCOM: "semiconductor",
  AMAT: "semiconductor",
  MU: "semiconductor",
  AMZN: "consumer",
  GOOGL: "technology",
  GOOG: "technology",
  META: "technology",
  NFLX: "media",
  TSLA: "automotive",
  ADBE: "software",
  CRM: "software",
  CSCO: "technology",
  COST: "retail",
  PEP: "consumer",
};

const SECTOR_LABEL: Record<string, string> = {
  technology: "Teknoloji",
  semiconductor: "Yarı iletken",
  software: "Yazılım",
  consumer: "Tüketici",
  media: "Medya",
  automotive: "Otomotiv",
  retail: "Perakende",
  index: "Endeks",
};

const PEER_GROUPS: Record<string, readonly string[]> = {
  technology: ["AAPL", "MSFT", "GOOGL", "META", "NVDA"],
  semiconductor: ["NVDA", "AMD", "AVGO", "INTC", "QCOM"],
  software: ["ADBE", "CRM", "MSFT", "ORCL"],
  consumer: ["AMZN", "PEP", "COST", "WMT"],
  media: ["NFLX", "DIS", "META"],
  automotive: ["TSLA", "F", "GM"],
  retail: ["COST", "WMT", "TGT"],
  index: ["NDX", "SPX", "QQQ", "COMP"],
};

const PEER_NAMES: Record<string, string> = {
  AAPL: "Apple",
  MSFT: "Microsoft",
  NVDA: "NVIDIA",
  AMD: "AMD",
  AVGO: "Broadcom",
  INTC: "Intel",
  QCOM: "Qualcomm",
  AMZN: "Amazon",
  GOOGL: "Alphabet",
  GOOG: "Alphabet C",
  META: "Meta",
  NFLX: "Netflix",
  TSLA: "Tesla",
  ADBE: "Adobe",
  CRM: "Salesforce",
  CSCO: "Cisco",
  COST: "Costco",
  PEP: "PepsiCo",
  NDX: "NASDAQ 100",
  SPX: "S&P 500",
  QQQ: "Invesco QQQ",
  COMP: "NASDAQ Composite",
  ORCL: "Oracle",
  DIS: "Disney",
  WMT: "Walmart",
  TGT: "Target",
  F: "Ford",
  GM: "General Motors",
};

export function isNasdaqIndexSymbol(symbol: string): boolean {
  return INDEX_SYMBOLS.has(symbol.trim().toUpperCase());
}

export function resolveNasdaqSector(symbol: string): string {
  const sym = symbol.trim().toUpperCase();
  if (isNasdaqIndexSymbol(sym)) return "index";
  return SECTOR_BY_SYMBOL[sym] ?? "technology";
}

export function nasdaqSectorLabel(symbol: string): string {
  const sector = resolveNasdaqSector(symbol);
  return SECTOR_LABEL[sector] ?? "NASDAQ";
}

export function nasdaqDisplayLabel(symbol: string, name?: string): string {
  const sym = symbol.trim().toUpperCase();
  if (name && name.trim() && name.trim().toUpperCase() !== sym) return name.trim();
  return sym;
}

export function nasdaqAssetCategory(symbol: string): "stocks" | "index" {
  const cat = inferMarketAssetCategory(symbol);
  if (cat === "index" || isNasdaqIndexSymbol(symbol)) return "index";
  return "stocks";
}

export function nasdaqPageClass(symbol: string): "nqx-page--stock" | "nqx-page--index" {
  return nasdaqAssetCategory(symbol) === "index" ? "nqx-page--index" : "nqx-page--stock";
}

export function nasdaqAccentFor(symbol: string): string {
  return nasdaqAssetCategory(symbol) === "index" ? "#3b82f6" : "#06b6d4";
}

export function parseNasdaqSymbol(raw: string | null): string | null {
  if (!raw) return null;
  const sym = raw.trim().toUpperCase().replace("/", "");
  if (!/^[A-Z]{1,5}$/.test(sym)) return null;
  const cat = inferMarketAssetCategory(sym);
  if (cat !== "stocks" && cat !== "index") return null;
  return sym;
}

export function yahooTickerFor(symbol: string): string | null {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  if (YAHOO_INDEX_TICKERS[sym]) return YAHOO_INDEX_TICKERS[sym]!;
  if (/^[A-Z]{1,5}$/.test(sym) && !sym.endsWith(".IS")) return sym;
  return null;
}

export function nasdaqNameFor(symbol: string, fallback?: string): string {
  const sym = symbol.trim().toUpperCase();
  return PEER_NAMES[sym] ?? nasdaqDisplayLabel(sym, fallback);
}

export function peerGroupFor(symbol: string): string[] {
  const sym = symbol.trim().toUpperCase();
  const sector = resolveNasdaqSector(sym);
  const group = PEER_GROUPS[sector] ?? PEER_GROUPS.technology!;
  const merged = [sym, ...group.filter((p) => p !== sym)];
  return [...new Set(merged)].slice(0, 6);
}

export function benchmarkSymbolFor(symbol: string): string {
  return isNasdaqIndexSymbol(symbol) ? "SPX" : "QQQ";
}
