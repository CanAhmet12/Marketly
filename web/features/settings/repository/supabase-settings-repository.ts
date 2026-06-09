import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSubscriptionRepository } from "@/features/subscriptions/repository";

import type { AccountControlHubPayload } from "../domain/types";

import type { SettingsRepository } from "./settings-repository";

const LINKS = {
  subscriptions: "/hub/subscriptions",
  close_friends: "/hub/close-friends",
  notifications: "/hub/notifications",
  messages: "/hub/messages",
  discover: "/discover",
} as const;

export class SupabaseSettingsRepository implements SettingsRepository {
  getAccountControlHub(viewerId: string | null): AccountControlHubPayload {
    const subHub = viewerId ? getSubscriptionRepository().getSubscriptionsHub(viewerId) : null;
    const lines =
      subHub?.active_memberships.slice(0, 6).map((m) => ({
        id: m.creator_id,
        title: m.display_name,
        sub: m.tier_label,
        href: m.href_detail,
      })) ?? [];
    return {
      headline: "Hesap kontrolü",
      subline: "Canlı veri modunda kişiselleştirme ve üyelik panelleri sunucuya bağlandığında burada zenginleşecek.",
      data_mode: "live_sparse",
      account_overview: {
        trust_line: "Güven özeti sunucu tarafında bekleniyor.",
        verification_line: "Doğrulama durumu — yakında.",
        premium_line: "Premium durumu — yakında.",
        session_hint: "Bu cihaz / oturum özeti yakında.",
        login_history_hint: "Giriş geçmişi kayıtları yakında.",
      },
      personalization: {
        confidence_line: "—",
        exploration_line: "—",
        novelty_line: "—",
        drift_line: "—",
        market_focus_line: "—",
        creator_cluster_hint: "—",
        intel_lines: [],
        muted: {
          creators_count: 0,
          assets_count: 0,
          topics_count: 0,
          sample_creator_ids: [],
          sample_assets: [],
        },
      },
      membership: {
        lines: lines.length
          ? lines
          : [{ id: "sub", title: "Üyelik merkezi", sub: "Planları yönet", href: LINKS.subscriptions }],
        billing_hint: "Faturalama entegrasyonu yakında.",
      },
      creator: {
        visible: false,
        headline: "Üretici kontrolleri",
        bullets: [],
        links: { upload: "/hub/upload", subscriptions: LINKS.subscriptions, close_friends: LINKS.close_friends },
      },
      links: { ...LINKS },
    };
  }

  resetFullPersonalization(): void {
    getPersonalizationRepository().clearBehavioralMemory();
  }

  resetRecommendationMemory(): void {
    getPersonalizationRepository().resetRecommendationMemory();
  }

  resetAdaptiveLearningMemory(): void {
    getPersonalizationRepository().resetAdaptiveLearningMemory();
  }
}
