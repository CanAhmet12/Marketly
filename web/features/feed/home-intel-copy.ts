import type { InterestIntelligenceSnapshot } from "@/features/personalization/domain/personalization-types";

/**
 * Phase 1C — tek satırlık, kullanıcı dilinde bağlam (teknik etiket yok).
 */
export function homeAmbientContextSummary(intel: InterestIntelligenceSnapshot): string | null {
  const sub = intel.subline?.trim();
  if (intel.coldStart) {
    return sub && sub.length > 0 ? sub : "Akışın yeni; keşfet ve tartışmalarla şekillenir.";
  }
  const themes = intel.marketThemes.slice(0, 2).map((m) => m.label).filter(Boolean);
  if (themes.length === 2) {
    return `${themes[0]} ve ${themes[1]} gündemde; akışın buna göre güncellendi.`;
  }
  if (themes.length === 1) {
    return `${themes[0]} öne çıkıyor; akışına yansıdı.`;
  }
  if (sub && sub.length > 0) return sub;
  return "İlgi alanlarına göre akış tazelendi.";
}
