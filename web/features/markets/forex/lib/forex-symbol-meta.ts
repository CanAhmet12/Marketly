import { pairLabel } from "@/features/markets/lib/live-category/live-category-shared";
import { inferMarketAssetCategory } from "@/lib/market-category";

const MAJOR_PAIRS = new Set([
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "USDCAD",
  "AUDUSD",
  "NZDUSD",
]);

const EXOTIC_PAIRS = new Set(["USDTRY", "EURTRY", "USDZAR", "USDMXN"]);

const PAIR_NAMES: Record<string, string> = {
  EURUSD: "Euro / Dolar",
  GBPUSD: "Sterlin / Dolar",
  USDJPY: "Dolar / Yen",
  USDCHF: "Dolar / Frank",
  USDCAD: "Dolar / Kanada Doları",
  AUDUSD: "Avustralya Doları / USD",
  NZDUSD: "Yeni Zelanda Doları / USD",
  USDTRY: "Dolar / Türk Lirası",
  EURTRY: "Euro / Türk Lirası",
  EURJPY: "Euro / Yen",
  GBPJPY: "Sterlin / Yen",
  EURGBP: "Euro / Sterlin",
  DXY: "Dolar Endeksi",
};

export type ForexPairCategory = "major" | "minor" | "exotic" | "macro";

export function normalizeForexSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace("/", "");
}

export function forexPairLabel(symbol: string): string {
  return pairLabel(symbol);
}

export function resolveForexPairCategory(symbol: string): ForexPairCategory {
  const sym = normalizeForexSymbol(symbol);
  if (sym === "DXY") return "macro";
  if (EXOTIC_PAIRS.has(sym)) return "exotic";
  if (MAJOR_PAIRS.has(sym)) return "major";
  return "minor";
}

export function forexPairCategoryLabel(symbol: string): string {
  switch (resolveForexPairCategory(symbol)) {
    case "major":
      return "Majör parite";
    case "minor":
      return "Minör parite";
    case "exotic":
      return "Egzotik parite";
    case "macro":
      return "Makro endeks";
  }
}

export function forexDisplayLabel(symbol: string, name?: string): string {
  const sym = normalizeForexSymbol(symbol);
  if (name && name.trim() && name.trim().toUpperCase() !== sym) return name.trim();
  return PAIR_NAMES[sym] ?? forexPairLabel(sym);
}

export function forexPageClass(_symbol: string): "fx-page--forex" {
  return "fx-page--forex";
}

export function forexAccentFor(_symbol: string): string {
  return "#8b5cf6";
}

export function parseForexSymbol(raw: string | null): string | null {
  if (!raw) return null;
  const sym = raw.trim().toUpperCase().replace("/", "");
  if (sym === "DXY") return sym;
  if (!/^[A-Z]{6}$/.test(sym)) return null;
  if (inferMarketAssetCategory(sym) !== "forex") return null;
  return sym;
}

export function yahooTickerFor(symbol: string): string | null {
  const sym = normalizeForexSymbol(symbol);
  if (sym === "DXY") return "DX-Y.NYB";
  if (/^[A-Z]{6}$/.test(sym)) return `${sym}=X`;
  return null;
}

export function relatedPairGroup(symbol: string): string[] {
  const sym = normalizeForexSymbol(symbol);
  const quote = sym.slice(3);
  const base = sym.slice(0, 3);

  const majors = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD"];
  const quoteGroup = majors.filter((p) => p.endsWith(quote) || p.startsWith(quote));
  const baseGroup = majors.filter((p) => p.startsWith(base) || p.endsWith(base));

  const merged = [sym, ...quoteGroup, ...baseGroup, "DXY"]
    .filter((p, i, arr) => arr.indexOf(p) === i && p !== sym)
    .slice(0, 5);

  return merged;
}
