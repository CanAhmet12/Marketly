import type { SupabaseClient } from "@supabase/supabase-js";

import type { StudioEconomyRevenueSnapshot } from "@/features/studio/repository/types";

/** Ekonomi bölgesi paleti — studio-tone-system economy ile uyumlu */
const SEGMENT_COLORS = {
  subscription: "#d4920a",
  signal: "#9a5f00",
  superThanks: "#7c5cfc",
  sponsor: "#4a90e8",
} as const;

function buildSegments(
  subscriptionUsd: number,
  signalUsd: number,
  superThanksUsd: number,
  sponsorUsd: number,
): StudioEconomyRevenueSnapshot["segments"] {
  const raw = [
    { label: "Abonelik", amountUsd: subscriptionUsd, color: SEGMENT_COLORS.subscription },
    { label: "Sinyal", amountUsd: signalUsd, color: SEGMENT_COLORS.signal },
    { label: "Super Thanks", amountUsd: superThanksUsd, color: SEGMENT_COLORS.superThanks },
    { label: "Sponsor", amountUsd: sponsorUsd, color: SEGMENT_COLORS.sponsor },
  ].filter((s) => s.amountUsd > 0);

  const total = raw.reduce((sum, s) => sum + s.amountUsd, 0) || 1;
  return raw.map((s) => ({
    label: s.label,
    color: s.color,
    amountUsd: s.amountUsd,
    pct: Math.max(1, Math.round((s.amountUsd / total) * 100)),
  }));
}

const SPARSE_SNAPSHOT: StudioEconomyRevenueSnapshot = {
  estimatedTotalUsd: null,
  changePercent: 0,
  segments: [],
  activeSubscribers: 0,
  monetizedSignals: 0,
  premiumRooms: 0,
  dataSource: "sparse",
};

/** Profil + içerik tabanlı live gelir tahmini */
export async function fetchStudioEconomySnapshot(
  client: SupabaseClient,
  ownerId: string,
): Promise<StudioEconomyRevenueSnapshot> {
  try {
    const [profileRes, signalRes, liveRes] = await Promise.all([
      client
        .from("profiles")
        .select("subscriber_count, subscription_price")
        .eq("id", ownerId)
        .maybeSingle(),
      client
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ownerId)
        .eq("type", "signal"),
      client
        .from("live_sessions")
        .select("id", { count: "exact", head: true })
        .eq("host_id", ownerId)
        .eq("is_active", false),
    ]);

    const subCount = Number(profileRes.data?.subscriber_count ?? 0);
    const price = Number(profileRes.data?.subscription_price ?? 0);
    const signalCount = signalRes.count ?? 0;
    const pastLiveCount = liveRes.count ?? 0;

    const subscriptionUsd = Math.round(subCount * price * 100) / 100;
    const signalUsd = Math.round(signalCount * 8.5 * 100) / 100;
    const superThanksUsd = Math.round(pastLiveCount * 2.4 * 100) / 100;
    const sponsorUsd = 0;

    const total = subscriptionUsd + signalUsd + superThanksUsd + sponsorUsd;
    if (total <= 0) {
      return {
        ...SPARSE_SNAPSHOT,
        monetizedSignals: signalCount,
        activeSubscribers: subCount,
      };
    }

    return {
      estimatedTotalUsd: total,
      changePercent: 0,
      segments: buildSegments(subscriptionUsd, signalUsd, superThanksUsd, sponsorUsd),
      activeSubscribers: subCount,
      monetizedSignals: signalCount,
      premiumRooms: Math.min(pastLiveCount, 3),
      dataSource: "live",
    };
  } catch (e) {
    console.warn("[studio] fetchStudioEconomySnapshot", e);
    return SPARSE_SNAPSHOT;
  }
}
