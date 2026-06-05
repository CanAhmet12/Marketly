/** Ortak piyasa yüzeyi — yüzde hareket ve tipografi sınıfları (Sinyaller / Keşfet ile uyumlu) */

export type MarketMovementTone = "up" | "down" | "flat";

export function trendToneLabel(trend: "up" | "down" | "flat"): string {
  if (trend === "up") return "Alıcı";
  if (trend === "down") return "Satıcı";
  return "Nötr";
}

export function marketMovementTone(changePercent: number): MarketMovementTone {
  if (changePercent > 0) return "up";
  if (changePercent < 0) return "down";
  return "flat";
}

/** Tablo / kart için yüzde metni (+ işareti dahil) */
export function formatSignedChangePercent(changePercent: number, fractionDigits = 2): string {
  const sign = changePercent > 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(fractionDigits)}%`;
}

/** Metin rengi — düz %0 nötr; aşırı neon yok */
export function changePercentTextClass(changePercent: number): string {
  const t = marketMovementTone(changePercent);
  if (t === "up") return "text-[color-mix(in_srgb,var(--color-rise)_92%,var(--color-text)_8%)]";
  if (t === "down") return "text-[color-mix(in_srgb,var(--color-fall)_90%,var(--color-text)_10%)]";
  return "text-[var(--color-meta)]";
}
