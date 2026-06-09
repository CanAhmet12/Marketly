import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchMembershipCatalog } from "@/features/subscriptions/fetch-membership-catalog";
import type { SubscriptionsHubPayload } from "@/features/subscriptions/domain/types";
import { buildSubscriptionRails } from "@/features/subscriptions/lib/build-subscription-rails";
import { fetchActiveMemberships } from "@/features/subscriptions/lib/fetch-active-memberships";
import { isSubscriptionWriteEnabled } from "@/features/subscriptions/lib/subscription-persistence";

const NAV = {
  signals: "/signals",
  discover: "/discover",
  watch: "/watch",
  markets: "/markets",
} as const;

/** Boş canlı fallback (query öncesi / hata sonrası) */
export function buildEmptySubscriptionsHubPayload(): SubscriptionsHubPayload {
  return fetchSubscriptionsHubLiveSyncEmpty();
}

function fetchSubscriptionsHubLiveSyncEmpty(): SubscriptionsHubPayload {
  const writeOn = isSubscriptionWriteEnabled();
  return {
    headline: "Üyelik merkezi",
    subline: "Katalog yüklenemedi veya henüz boş.",
    affinity_line: "Keşfet ve sinyaller üzerinden ilerleyebilirsin.",
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
      premium_circulation_label: "Veri bekleniyor",
      room_desk_label: "Veri bekleniyor",
      signal_archive_label: "Veri bekleniyor",
    },
    nav: { ...NAV },
    data_mode: "live_sparse",
    write_enabled: writeOn,
  };
}

/** Canlı hub payload — katalog + aktif üyelikler + rail mantığı */
export async function fetchSubscriptionsHubLive(
  client: SupabaseClient,
  viewerId: string | null,
): Promise<SubscriptionsHubPayload> {
  const [catalog, active] = await Promise.all([
    fetchMembershipCatalog(client),
    viewerId ? fetchActiveMemberships(client, viewerId) : Promise.resolve([]),
  ]);

  const subscribedIds = active.map((a) => a.creator_id);
  const rails = buildSubscriptionRails(catalog, subscribedIds);
  const hasCatalog = catalog.length > 0;
  const activeCreators = catalog.filter((c) => c.heat_score >= 0.55).length;
  const signalHeavy = catalog.filter((c) => c.strategy_focus_label === "Sinyal odaklı").length;
  const writeOn = isSubscriptionWriteEnabled();

  return {
    headline: "Üyelik merkezi",
    subline: hasCatalog
      ? writeOn
        ? "Üretici planlarına abone olabilir veya iptal edebilirsin. Ödeme entegrasyonu sonraki fazda."
        : "Katalog canlı — abonelik kaydı salt-okuma modunda kapalı (NEXT_PUBLIC_WEB_WRITE_ENABLED)."
      : "Henüz ücretli üyelik tanımlayan üretici yok.",
    affinity_line: hasCatalog
      ? active.length > 0
        ? `${active.length} aktif üyeliğin · ${activeCreators} üretici son dönemde aktif`
        : activeCreators > 0
          ? `${activeCreators} üretici aktif · keşfet sekmesinden plan incele`
          : "Katalog canlı — üretici aktivitesi izleniyor"
      : "Takip ve izleme listesi oluşturdukça öneriler zenginleşir.",
    cold_start: !hasCatalog && active.length === 0,
    strategy_profile_label: hasCatalog
      ? signalHeavy >= Math.max(1, catalog.length / 2)
        ? "Sinyal ağırlıklı"
        : "Dengeli strateji"
      : "Profil oluşuyor",
    active_memberships: active,
    catalog,
    rails,
    platform_intel: {
      premium_circulation_label: hasCatalog ? `${catalog.length} ücretli katman` : "Henüz ücretli katman yok",
      room_desk_label:
        active.length > 0
          ? `${active.length} aktif üyelik · ${rails.premium_room_spotlight.length} premium oda adayı`
          : activeCreators > 0
            ? `${activeCreators} aktif üretici`
            : "Üretici aktivitesi düşük",
      signal_archive_label:
        signalHeavy > 0 ? `${signalHeavy} sinyal odaklı üretici` : "Sinyal arşivi oluşuyor",
    },
    nav: { ...NAV },
    data_mode: hasCatalog || active.length > 0 ? "live" : "live_sparse",
    write_enabled: writeOn,
  };
}
