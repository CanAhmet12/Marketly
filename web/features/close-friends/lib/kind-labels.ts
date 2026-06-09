import type { PrivateCircleKind } from "@/features/close-friends/domain/types";

const KIND_LABELS: Record<PrivateCircleKind, string> = {
  close_followers: "Yakın takipçiler",
  premium_members: "Premium üyeler",
  signal_desk: "Sinyal masası",
  macro_club: "Makro kulübü",
  institutional_room: "Kurumsal oda",
  elite_subscribers: "Elite aboneler",
  research_circle: "Araştırma çemberi",
  inner_strategy: "İç strateji grubu",
  creator_selected: "Üretici seçkisi",
};

export function formatCircleKind(kind: PrivateCircleKind): string {
  return KIND_LABELS[kind] ?? kind.replace(/_/g, " ");
}
