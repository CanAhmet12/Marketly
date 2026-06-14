import {
  forexDisplayLabel,
  forexPairCategoryLabel,
  forexPairLabel,
  normalizeForexSymbol,
} from "@/features/markets/forex/lib/forex-symbol-meta";

export function forexPageSeo(symbol: string): { title: string; description: string } {
  const sym = normalizeForexSymbol(symbol);
  const name = forexDisplayLabel(sym);
  const pair = forexPairLabel(sym);
  const category = forexPairCategoryLabel(sym);

  return {
    title: `${name} (${pair}) · Forex ${category}`,
    description: `${pair} canlı kur, pro mum grafik, makro faiz, spread/seans, carry swap ve ${category.toLowerCase()} sinyalleri — Marketly forex detay sayfası.`,
  };
}

export function forexCanonicalPath(symbol: string): string {
  const sym = normalizeForexSymbol(symbol);
  return `/markets/${encodeURIComponent(sym)}`;
}
