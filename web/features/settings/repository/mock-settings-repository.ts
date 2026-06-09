import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSubscriptionRepository } from "@/features/subscriptions/repository";
import { MOCK_PROFILE_BY_ID } from "@/mock/fixtures/profiles";

import type {
  AccountControlHubPayload,
  AccountControlIntelLine,
  MembershipManagementLine,
} from "../domain/types";

import type { SettingsRepository } from "./settings-repository";

const LINKS = {
  subscriptions: "/hub/subscriptions",
  close_friends: "/hub/close-friends",
  notifications: "/hub/notifications",
  messages: "/hub/messages",
  discover: "/discover",
} as const;

export class MockSettingsRepository implements SettingsRepository {
  getAccountControlHub(viewerId: string | null): AccountControlHubPayload {
    const p = getPersonalizationRepository();
    const intel = p.getInterestIntelligence();
    const aff = p.getAffinityContext();
    const adapt = p.getRecommendationAdaptationSnapshot(viewerId);
    const fb = p.getFeedFeedbackState();
    const ex = p.getExplorationFeedbackState();
    const wf = p.getWatchFeedbackState();
    const rec = p.getRecommendationMemoryState();
    const subHub = viewerId ? getSubscriptionRepository().getSubscriptionsHub(viewerId) : null;

    const intel_lines: AccountControlIntelLine[] = [
      { id: "horizon", label: "Ufuk", value: intel.horizonLabel },
      { id: "confidence", label: "Güven bandı", value: intel.confidenceLabel },
      { id: "format", label: "Format özeti", value: intel.formatSummary },
      ...intel.strongest.slice(0, 4).map((c, i) => ({
        id: `chip-${i}`,
        label: "Güçlü ilgi",
        value: c.label,
      })),
    ];

    const muted = {
      creators_count: fb.muteCreators.length + wf.hideCreators.length,
      assets_count: fb.muteAssets.length,
      topics_count: fb.notInterestedTopics.length,
      sample_creator_ids: [...new Set([...fb.muteCreators, ...wf.hideCreators])].slice(0, 4),
      sample_assets: fb.muteAssets.slice(0, 4),
    };

    const exploration_line =
      ex.hideTopics.length + ex.notInterestedCreators.length > 6
        ? "Keşif sıkılığı yüksek — daha seçici yüzey"
        : "Keşif dengesi nötr — yeni içerik ağırlığı korunuyor";

    const novelty_line =
      aff.meta.diversity > 0.55 ? "Yenilik tercihi yüksek" : aff.meta.diversity < 0.4 ? "Tutarlılık / tekrar tercihi belirgin" : "Yenilik — tutarlılık dengeli";

    const membership_lines: MembershipManagementLine[] = [];
    if (subHub) {
      for (const m of subHub.active_memberships.slice(0, 6)) {
        membership_lines.push({
          id: m.creator_id,
          title: m.display_name,
          sub: `${m.tier_label} · üyelik`,
          href: m.href_detail,
        });
      }
      if (membership_lines.length === 0) {
        membership_lines.push({
          id: "sub-hub",
          title: "Üyelik merkezi",
          sub: "Aktif plan yok — keşfet ve öneriler",
          href: LINKS.subscriptions,
        });
      }
    } else {
      membership_lines.push({
        id: "login",
        title: "Oturum",
        sub: "Üyelik özeti için giriş gerekir",
        href: "/auth/login",
      });
    }

    const prof = viewerId ? MOCK_PROFILE_BY_ID[viewerId] : undefined;
    const isCreator = Boolean(prof && (prof.verified || prof.follower_count > 80_000));

    return {
      headline: "Hesap kontrol merkezi",
      subline:
        "Kişiselleştirme, gizlilik, bildirimler ve üyelik tek yerde. Kararların Marketly öneri motoruna şeffaf biçimde yansır.",
      data_mode: "mock",
      account_overview: {
        trust_line: prof ? `Hesap güveni: ${prof.verified ? "doğrulanmış" : "standart"}` : "Profil eşlemesi mock kataloğunda yok — genel güven bandı.",
        verification_line: prof?.verified ? "Üretici doğrulaması aktif" : "Doğrulama başvurusu yok (mock)",
        premium_line: prof?.tier ? `Üyelik seviyesi: ${prof.tier}` : "Premium durumu: standart",
        session_hint: "Bu tarayıcı oturumu — cihaz listesi yakında",
        login_history_hint: "Son giriş kayıtları sunucuya bağlandığında görünecek",
      },
      personalization: {
        confidence_line: intel.confidenceLabel,
        exploration_line,
        novelty_line,
        drift_line: `Adaptasyon: ${adapt.driftLabel ?? adapt.hints[0] ?? adapt.subline}`,
        market_focus_line: intel.marketThemes.slice(0, 2).map((t) => t.label).join(" · ") || "Makro odağı oluşuyor",
        creator_cluster_hint: `Öneri belleği: ${rec.hideCreatorIds.length} gizli · ${rec.lessCreatorIds.length} daha az`,
        intel_lines,
        muted,
      },
      membership: {
        lines: membership_lines,
        billing_hint: "Faturalama: üretimde Stripe / yerel ödeme — mock’ta yer tutucu.",
      },
      creator: {
        visible: isCreator,
        headline: "Üretici kontrolleri",
        bullets: [
          "Varsayılan yayın kitlesi: üyelik / özel daire seçimi yükleme akışında.",
          "Oda ve premium sinyal görünürlüğü: kanal sekmeleri + üyelik planı.",
          "Öneri görünürlüğü: keşif ve ana akışta üretici önerileri için geri bildirim kullan.",
        ],
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
