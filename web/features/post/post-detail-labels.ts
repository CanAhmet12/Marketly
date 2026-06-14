/** Gönderi detay — Türkçe rozet / etiket metinleri */

export const POST_DETAIL_VERIFIED_LABEL = "Doğrulandı";

export function postDetailTierLabel(tier: string): string | null {
  const t = tier.toLowerCase();
  if (t === "elite") return "Elite";
  if (t === "pro") return "Pro";
  return null;
}
