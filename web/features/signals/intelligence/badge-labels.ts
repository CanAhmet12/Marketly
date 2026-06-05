import type { AnalystBadgeId } from "@/features/signals/intelligence/types";

const M: Record<AnalystBadgeId, string> = {
  institutional_style: "Kurumsal üslup",
  macro_specialist: "Makro uzmanı",
  momentum_trader: "Momentum",
  community_trusted: "Topluluk güveni",
  premium_strategist: "Premium stratejist",
  veteran_analyst: "Kıdemli analist",
  rising_creator: "Yükselen üretici",
};

export function analystBadgeLabelTr(id: AnalystBadgeId): string {
  return M[id] ?? id;
}
