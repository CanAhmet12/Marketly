import {
  isNasdaqIndexSymbol,
  nasdaqNameFor,
  nasdaqSectorLabel,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";

export function nasdaqPageSeo(symbol: string): { title: string; description: string } {
  const sym = symbol.trim().toUpperCase();
  const name = nasdaqNameFor(sym);
  const sector = nasdaqSectorLabel(sym);
  const kind = isNasdaqIndexSymbol(sym) ? "Endeks" : "Hisse";

  return {
    title: `${name} (${sym}) · NASDAQ ${kind}`,
    description: `${name} canlı fiyat, pro grafik, temel analiz, peer karşılaştırma ve ${sector} sinyalleri — Marketly NASDAQ detay sayfası.`,
  };
}
