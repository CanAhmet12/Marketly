import {
  bistDisplayLabel,
  bistSectorLabel,
  isBistIndexSymbol,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";

export function bistPageSeo(symbol: string): { title: string; description: string } {
  const sym = normalizeBistSymbol(symbol);
  const name = bistDisplayLabel(sym);
  const sector = bistSectorLabel(sym);
  const kind = isBistIndexSymbol(sym) ? "Endeks" : "Hisse";

  return {
    title: `${name} (${sym}) · BIST ${kind}`,
    description: `${name} canlı fiyat, pro mum grafik, temel analiz, sektör peer karşılaştırma, seans/likidite ve ${sector} sinyalleri — Marketly BIST detay sayfası.`,
  };
}

export function bistCanonicalPath(symbol: string): string {
  const sym = normalizeBistSymbol(symbol);
  return `/markets/${encodeURIComponent(sym)}`;
}
