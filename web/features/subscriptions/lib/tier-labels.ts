import type { MembershipTierKey } from "@/features/subscriptions/domain/types";

const TIER_LABELS: Record<MembershipTierKey, string> = {
  free: "Ücretsiz",
  premium: "Premium",
  elite: "Elite",
  institutional: "Kurumsal",
  private_room: "Özel Oda",
  strategy_club: "Strateji Kulübü",
  macro_research: "Makro Araştırma",
  signal_desk: "Sinyal Masası",
};

export function formatTierKey(key: MembershipTierKey): string {
  return TIER_LABELS[key] ?? key.replace(/_/g, " ");
}
