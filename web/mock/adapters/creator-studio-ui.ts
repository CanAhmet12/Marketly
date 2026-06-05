/** Studio kabuğu — kısa bilgilendirme (veri satırı değil). */
export function getStudioShellNotice(mockDataset: boolean): string | null {
  if (mockDataset) return null;
  return "Mock veri kapalı: Creator Studio metrikleri sıfır; Supabase + repository katmanı bağlandığında burası canlı veriyle dolar.";
}

export function getStudioShellSubtitle(): string {
  return "YouTube Studio tarzı özet; finans ve sinyal katmanı Marketly kimliğiyle birleşir. Liste ve metrikler repository / adapter katmanından gelir.";
}
