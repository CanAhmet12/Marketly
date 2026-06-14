import { resolveBistScreenerSector } from "@/features/markets/bist/lib/bist-regime-utils";
import { inferMarketAssetCategory } from "@/lib/market-category";

const BIST_SYMBOLS = new Set([
  "XU100", "XU030", "BIST100", "BIST30", "THYAO", "GARAN", "ASELS", "BIMAS", "SAHOL", "KCHOL",
  "EREGL", "SISE", "TUPRS", "YKBNK", "AKBNK", "ISCTR", "PGSUS", "TCELL", "FROTO", "TOASO",
  "HALKB", "VAKBN", "PETKM", "MGROS", "ARCLK", "TTKOM", "DOHOL", "ENKAI",
]);

const INDEX_NAMES: Record<string, string> = {
  XU100: "BIST 100",
  BIST100: "BIST 100",
  XU030: "BIST 30",
  BIST30: "BIST 30",
  XUBANK: "BIST Banka",
};

const SCREENER_LABELS: Record<string, string> = {
  bankacilik: "Bankacılık",
  holding: "Holding",
  sanayi: "Sanayi",
  ulasim: "Ulaşım",
  enerji: "Enerji",
  perakende: "Perakende",
  insaat: "İnşaat",
  teknoloji: "Teknoloji",
  diger: "Diğer",
};

export function normalizeBistSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(".IS", "");
}

export function isBistIndexSymbol(symbol: string): boolean {
  const sym = normalizeBistSymbol(symbol);
  return sym.startsWith("XU") || sym.startsWith("BIST") || sym === "XUBANK";
}

export function isBistSymbol(symbol: string): boolean {
  const raw = symbol.trim().toUpperCase();
  const sym = normalizeBistSymbol(raw);
  if (BIST_SYMBOLS.has(sym)) return true;
  if (sym.includes("XU") || sym.includes("BIST")) return true;
  const cat = inferMarketAssetCategory(sym);
  if (cat === "index" && (sym.includes("XU") || sym.includes("BIST"))) return true;
  if (cat === "stocks" && raw.endsWith(".IS")) return true;
  return false;
}

export function parseBistSymbol(raw: string | null): string | null {
  if (!raw) return null;
  const sym = normalizeBistSymbol(raw);
  if (!isBistSymbol(sym)) return null;
  return sym;
}

export function bistPageClass(symbol: string): string {
  return isBistIndexSymbol(symbol) ? "bc-page--bist bc-page--index" : "bc-page--bist bc-page--stock";
}

export function bistAccentFor(symbol: string): string {
  return isBistIndexSymbol(symbol) ? "#3b82f6" : "#2563eb";
}

export function bistSectorLabel(symbol: string): string {
  return SCREENER_LABELS[resolveBistScreenerSector(symbol)] ?? "Diğer";
}

export function bistKindLabel(symbol: string): string {
  if (isBistIndexSymbol(symbol)) return "BIST Endeks";
  return bistSectorLabel(symbol);
}

export function bistDisplayLabel(symbol: string, name?: string): string {
  const sym = normalizeBistSymbol(symbol);
  if (name && name.trim() && name.trim().toUpperCase() !== sym) return name.trim();
  return INDEX_NAMES[sym] ?? sym;
}

export function yahooTickerFor(symbol: string): string {
  return `${normalizeBistSymbol(symbol)}.IS`;
}

const PEER_GROUPS: Record<string, string[]> = {
  bankacilik: ["GARAN", "AKBNK", "YKBNK", "ISCTR", "HALKB"],
  holding: ["KCHOL", "SAHOL", "DOHOL", "TUPRS"],
  sanayi: ["EREGL", "TUPRS", "SISE", "PETKM", "ARCLK"],
  ulasim: ["THYAO", "PGSUS", "TOASO", "FROTO"],
  enerji: ["AKSEN", "AYDEM", "ZOREN", "ENJSA"],
  perakende: ["BIMAS", "MGROS", "SOKM", "BIZIM"],
  insaat: ["ENKAI", "TKFEN", "YYAPI", "ORGE"],
  teknoloji: ["ASELS", "LOGO", "NETAS", "KAREL"],
  diger: ["THYAO", "GARAN", "ASELS", "BIMAS", "EREGL"],
};

export function bistNameFor(symbol: string, fallback?: string): string {
  return bistDisplayLabel(symbol, fallback);
}

export function peerGroupFor(symbol: string): string[] {
  const sym = normalizeBistSymbol(symbol);
  if (isBistIndexSymbol(sym)) {
    const indexPeers = ["XU100", "XU030", "BIST100", "BIST30"];
    return [...new Set([sym, ...indexPeers.filter((p) => p !== sym)])].slice(0, 6);
  }
  const sector = resolveBistScreenerSector(sym);
  const group = PEER_GROUPS[sector] ?? PEER_GROUPS.diger!;
  return [...new Set([sym, "XU100", ...group.filter((p) => p !== sym)])].slice(0, 6);
}

export function benchmarkSymbolFor(symbol: string): string {
  const sym = normalizeBistSymbol(symbol);
  if (sym === "XU030" || sym === "BIST30") return "XU100";
  return "XU100";
}
