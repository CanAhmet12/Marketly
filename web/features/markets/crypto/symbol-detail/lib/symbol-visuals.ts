type SymbolVisual = { glyph: string; bg: string; fg?: string };

const SYMBOL_VISUALS: Record<string, SymbolVisual> = {
  BTC: { glyph: "₿", bg: "#F7931A" },
  ETH: { glyph: "Ξ", bg: "#627EEA" },
  SOL: { glyph: "S", bg: "#9945FF" },
  BNB: { glyph: "B", bg: "#F3BA2F", fg: "#1a1a1a" },
  XRP: { glyph: "X", bg: "#23292F" },
  ADA: { glyph: "A", bg: "#0033AD" },
  DOGE: { glyph: "Ð", bg: "#C2A633", fg: "#1a1a1a" },
  AVAX: { glyph: "A", bg: "#E84142" },
  DOT: { glyph: "D", bg: "#E6007A" },
  LTC: { glyph: "Ł", bg: "#345D9D" },
};

export function resolveSymbolVisual(symbol: string): SymbolVisual {
  const key = symbol.trim().toUpperCase();
  return SYMBOL_VISUALS[key] ?? { glyph: key.slice(0, 2), bg: "#374151" };
}

export function symbolAccentColor(symbol: string): string {
  const key = symbol.trim().toUpperCase();
  if (key === "BTC") return "#F7931A";
  if (key === "ETH") return "#627EEA";
  if (key === "SOL") return "#9945FF";
  return resolveSymbolVisual(key).bg;
}
