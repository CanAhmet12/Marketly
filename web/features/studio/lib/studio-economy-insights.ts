import type {
  CreatorStudioEconomyHubPayload,
  StudioEconomyMemberSegment,
  StudioEconomyRevenueSnapshot,
} from "@/features/studio/repository/types";

export const ECONOMY_SEGMENT_LABEL: Record<StudioEconomyMemberSegment, string> = {
  subscriber: "Abone",
  trusted: "Güvenilir",
  premium: "Premium",
  room_leader: "Oda Lideri",
  high_engagement: "Yoğun Etkileşim",
  overlap: "Kesişim",
};

export const ECONOMY_SEGMENT_COLOR: Record<StudioEconomyMemberSegment, string> = {
  subscriber: "#d4920a",
  trusted: "#4a90e8",
  premium: "#9a5f00",
  room_leader: "#dc2626",
  high_engagement: "#7c5cfc",
  overlap: "#14a89a",
};

export const SIGNAL_ACCESS_LABEL: Record<string, string> = {
  public: "Herkese Açık",
  preview: "Önizleme",
  locked: "Kilitli",
  subscriber: "Abonelik",
};

/** Mock gelir — hub verisinden türetilmiş (hardcoded $1284 kaldırıldı) */
export function buildMockRevenueSnapshot(
  ownerId: string,
  hub: CreatorStudioEconomyHubPayload,
): StudioEconomyRevenueSnapshot {
  if (hub.data_sparse) {
    return {
      estimatedTotalUsd: null,
      changePercent: 0,
      segments: [],
      activeSubscribers: 0,
      monetizedSignals: hub.signal_controls.length,
      premiumRooms: hub.room_controls.filter((r) => r.premium).length,
      dataSource: "sparse",
    };
  }

  let seed = 0;
  for (let i = 0; i < ownerId.length; i++) seed = (seed * 31 + ownerId.charCodeAt(i)) | 0;
  const r = Math.abs(seed);

  const subBase = 400 + (r % 900);
  const signalBase = 180 + (r % 420);
  const thanksBase = 60 + (r % 180);
  const sponsorBase = 20 + (r % 80);
  const total = subBase + signalBase + thanksBase + sponsorBase;

  return {
    estimatedTotalUsd: Math.round(total * 100) / 100,
    changePercent: 4 + (r % 18),
    segments: [
      { label: "Abonelik", pct: Math.round((subBase / total) * 100), color: "#d4920a", amountUsd: subBase },
      { label: "Sinyal", pct: Math.round((signalBase / total) * 100), color: "#9a5f00", amountUsd: signalBase },
      { label: "Super Thanks", pct: Math.round((thanksBase / total) * 100), color: "#7c5cfc", amountUsd: thanksBase },
      { label: "Sponsor", pct: Math.max(1, 100 - Math.round((subBase / total) * 100) - Math.round((signalBase / total) * 100) - Math.round((thanksBase / total) * 100)), color: "#4a90e8", amountUsd: sponsorBase },
    ],
    activeSubscribers: hub.members.length + hub.tiers.length * 12,
    monetizedSignals: hub.signal_controls.length,
    premiumRooms: hub.room_controls.filter((room) => room.premium).length,
    dataSource: "mock",
  };
}

export function formatRevenueUsd(amount: number | null): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function mergeEconomyWithSnapshot(
  hub: CreatorStudioEconomyHubPayload,
  snapshot: StudioEconomyRevenueSnapshot,
): CreatorStudioEconomyHubPayload {
  return { ...hub, revenue_snapshot: snapshot };
}

export type AudienceIntelRow = { label: string; value: string };

export function audienceIntelRows(hub: CreatorStudioEconomyHubPayload): AudienceIntelRow[] {
  const a = hub.audience;
  return [
    { label: "Abone ivmesi", value: a.subscriber_momentum },
    { label: "Oda etkileşimi", value: a.room_engagement },
    { label: "Premium katılım", value: a.premium_participation },
    { label: "Tartışma kalitesi", value: a.discussion_quality },
    { label: "Sinyal etkileşimi", value: a.signal_interaction },
    { label: "Sadakat", value: a.loyalty },
  ].filter((row) => row.value && row.value !== "—");
}
