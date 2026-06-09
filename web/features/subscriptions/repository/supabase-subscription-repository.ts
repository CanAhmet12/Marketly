import type { MembershipDetailPayload, SubscriptionsHubPayload } from "../domain/types";

import type { SubscriptionRepository } from "./subscription-repository";

const NAV = {
  signals: "/signals",
  discover: "/discover",
  watch: "/watch",
  markets: "/markets",
} as const;

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

export class SupabaseSubscriptionRepository implements SubscriptionRepository {
  getSubscriptionsHub(_viewerId: string | null): SubscriptionsHubPayload {
    void _viewerId;
    return {
      headline: "Üyelik merkezi",
      subline: "Canlı veri modunda üyelik kataloğu sunucudan beslenecek; şimdilik keşif ve sinyaller üzerinden ilerleyebilirsin.",
      affinity_line: "Kişiselleştirme sunucu tarafında açıldığında öneriler burada görünecek.",
      cold_start: true,
      strategy_profile_label: "Profil oluşuyor",
      active_memberships: [],
      catalog: [],
      rails: {
        recommended_for_you: [],
        rising_premium: [],
        institutional_style: [],
        strategy_focused: [],
        portfolio_aligned: [],
        premium_room_spotlight: [],
        macro_desk: [],
        high_conviction: [],
      },
      platform_intel: {
        premium_circulation_label: "Premium dolaşım verisi bekleniyor",
        room_desk_label: "Oda / masa yoğunluğu bekleniyor",
        signal_archive_label: "Arşiv erişim özeti bekleniyor",
      },
      nav: { ...NAV },
      data_mode: "live_sparse",
      write_enabled: false,
    };
  }

  getMembershipDetail(creatorId: string, _viewerId: string | null): MembershipDetailPayload | null {
    void _viewerId;
    if (!creatorId.trim()) return null;
    return {
      creator_id: creatorId,
      display_name: "Üretici",
      handle: "@",
      avatar_url: null,
      verified: false,
      overview: "Üyelik detayları canlı modda henüz bağlı değil. Kanal ve sinyaller sekmesinden üreticiyi inceleyebilirsin.",
      strategy_summary: "Strateji özeti yakında.",
      tiers: [
        {
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
        },
      ],
      intel: { ...EMPTY_INTEL },
      unlocks_editorial: ["Sunucu üyelik paketleri bağlandığında kilitler burada listelenecek."],
      room_previews: [],
      discussion_previews: [],
      signal_previews: [],
      activity_timeline: [],
      archive_hint: "Premium arşiv önizlemesi canlı modda yok.",
      links: {
        channel: `/channel/${encodeURIComponent(creatorId)}`,
        signals: "/signals",
        rooms_tab: `/channel/${encodeURIComponent(creatorId)}?tab=rooms`,
        discover: "/discover",
      },
      subscription: { subscribed: false, tier: null, subscribed_at: null },
      write_enabled: false,
    };
  }
}
