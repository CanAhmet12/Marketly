import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MembershipDetailPayload,
  MembershipDiscoveryCard,
  MembershipTierDefinition,
  MembershipTierKey,
  SubscriptionsHubPayload,
} from "@/features/subscriptions/domain/types";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  tier: string | null;
  subscription_price: number | null;
  bio: string | null;
};

const EMPTY_INTEL = {
  subscriber_momentum_label: "—",
  premium_engagement_label: "—",
  consistency_label: "—",
  premium_hit_rate_label: "—",
  institutional_confidence_label: "—",
  room_participation_label: "—",
  strategy_quality_label: "—",
  premium_activity_heat_label: "—",
} as const;

function mapCatalogCard(row: ProfileRow): MembershipDiscoveryCard {
  const tierKeys: MembershipTierKey[] =
    row.subscription_price && row.subscription_price > 0
      ? row.tier === "elite"
        ? ["free", "elite"]
        : ["free", "premium"]
      : ["free"];

  return {
    creator_id: row.id,
    display_name: row.full_name?.trim() || row.username?.trim() || "Üretici",
    handle: `@${row.username ?? "user"}`,
    avatar_url: row.avatar_url,
    verified: Boolean(row.verified),
    thesis_line: row.bio?.trim() || "Piyasa ve teknik akış",
    strategy_focus_label: "Çoklu varlık",
    timeframe_label: "Orta vade",
    macro_vs_momentum: "balanced",
    rel_label: row.subscription_price ? `₺${row.subscription_price}/ay` : "Ücretsiz katman",
    rel_kind: "rising_premium",
    tier_keys: tierKeys,
    intel: { ...EMPTY_INTEL },
    href_detail: `/subscriptions/${row.id}`,
    href_channel: `/channel/${row.id}`,
    heat_score: row.subscription_price ? 0.6 : 0.3,
  };
}

function buildFreeTier(): MembershipTierDefinition {
  return {
    key: "free",
    label: "Ücretsiz",
    pitch: "Genel akış ve herkese açık içerikler.",
    monthly_hint: null,
    access: {
      rooms: "preview",
      signals: "preview",
      discussions: "preview",
      watchlists: "none",
      live: "preview",
      research: "none",
      archives: "none",
      notes: "none",
    },
    highlight: false,
  };
}

function buildPremiumTier(price: number | null): MembershipTierDefinition | null {
  if (!price || price <= 0) return null;
  return {
    key: "premium",
    label: "Premium",
    pitch: "Özel sinyaller, odalar ve arşiv erişimi.",
    monthly_hint: `₺${price}/ay`,
    access: {
      rooms: "full",
      signals: "full",
      discussions: "full",
      watchlists: "full",
      live: "full",
      research: "preview",
      archives: "preview",
      notes: "preview",
    },
    highlight: true,
  };
}

/** profiles.subscription_price > 0 → public üyelik kataloğu */
export async function fetchMembershipCatalog(
  client: SupabaseClient,
  limit = 24,
): Promise<MembershipDiscoveryCard[]> {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("id, username, full_name, avatar_url, verified, tier, subscription_price, bio")
      .gt("subscription_price", 0)
      .order("subscription_price", { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.warn("[subscriptions] fetchMembershipCatalog", error?.message);
      return [];
    }
    return (data as ProfileRow[]).map(mapCatalogCard);
  } catch (e) {
    console.warn("[subscriptions] fetchMembershipCatalog", e);
    return [];
  }
}

export async function fetchMembershipDetail(
  client: SupabaseClient,
  creatorId: string,
): Promise<MembershipDetailPayload | null> {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("id, username, full_name, avatar_url, verified, tier, subscription_price, bio")
      .eq("id", creatorId)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as ProfileRow;
    const premium = buildPremiumTier(row.subscription_price);
    const tiers = premium ? [buildFreeTier(), premium] : [buildFreeTier()];

    return {
      creator_id: row.id,
      display_name: row.full_name?.trim() || row.username?.trim() || "Üretici",
      handle: `@${row.username ?? "user"}`,
      avatar_url: row.avatar_url,
      verified: Boolean(row.verified),
      overview: row.bio?.trim() || "Üretici üyelik kataloğu — ödeme entegrasyonu henüz aktif değil.",
      strategy_summary: "Strateji özeti kanal ve sinyaller sekmesinde.",
      tiers,
      intel: { ...EMPTY_INTEL },
      unlocks_editorial: premium
        ? ["Premium sinyaller", "Özel odalar", "Arşiv önizlemesi"]
        : ["Herkese açık akış"],
      room_previews: [],
      discussion_previews: [],
      signal_previews: [],
      activity_timeline: [],
      archive_hint: "Ödeme sistemi bağlandığında arşiv erişimi burada açılacak.",
      links: {
        channel: `/channel/${row.id}`,
        signals: `/channel/${row.id}?tab=signals`,
        rooms_tab: `/channel/${row.id}?tab=rooms`,
        discover: "/discover",
      },
    };
  } catch {
    return null;
  }
}

export function buildSubscriptionsHubPayload(catalog: MembershipDiscoveryCard[]): SubscriptionsHubPayload {
  const hasCatalog = catalog.length > 0;
  return {
    headline: "Üyelik merkezi",
    subline: hasCatalog
      ? "Üretici üyelik kataloğu canlı profil verisinden geliyor. Satın alma yakında — şimdilik keşif ve kanal üzerinden inceleyebilirsin."
      : "Henüz ücretli üyelik tanımlayan üretici yok. Keşfet ve sinyaller üzerinden ilerleyebilirsin.",
    affinity_line: "Kişiselleştirme sunucu tarafında açıldığında öneriler burada görünecek.",
    cold_start: !hasCatalog,
    strategy_profile_label: "Profil oluşuyor",
    active_memberships: [],
    catalog,
    rails: {
      recommended_for_you: catalog.slice(0, 6),
      rising_premium: catalog.slice(0, 4),
      institutional_style: [],
      strategy_focused: catalog.slice(4, 10),
      portfolio_aligned: [],
      premium_room_spotlight: [],
      macro_desk: [],
      high_conviction: catalog.filter((c) => c.tier_keys.includes("elite")).slice(0, 4),
    },
    platform_intel: {
      premium_circulation_label: hasCatalog ? `${catalog.length} ücretli katman` : "Premium dolaşım verisi bekleniyor",
      room_desk_label: "Oda / masa yoğunluğu bekleniyor",
      signal_archive_label: "Arşiv erişim özeti bekleniyor",
    },
    nav: {
      signals: "/signals",
      discover: "/discover",
      watch: "/watch",
      markets: "/markets",
    },
    data_mode: "live_sparse",
  };
}
