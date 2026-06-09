import type { SupabaseClient } from "@supabase/supabase-js";

import type { CloseFriendsHubPayload } from "@/features/close-friends/domain/types";
import { buildCircleRails } from "@/features/close-friends/lib/build-circle-rails";
import { circlesFromFriends } from "@/features/close-friends/lib/circle-factory";
import { fetchTrustedMembers } from "@/features/close-friends/lib/fetch-trusted-members";
import { isCloseFriendsWriteEnabled } from "@/features/close-friends/lib/close-friends-persistence";

const NAV = {
  subscriptions: "/hub/subscriptions",
  messages: "/hub/messages",
  notifications: "/hub/notifications",
  discover: "/discover",
  watch: "/watch",
} as const;

export function buildEmptyCloseFriendsHubPayload(): CloseFriendsHubPayload {
  return {
    headline: "Yakın Arkadaşlar",
    subline: "Katalog yüklenemedi veya henüz boş.",
    affinity_line: "Ayarlar üzerinden çekirdek üreticilerini ekleyebilirsin.",
    trusted_members: [],
    your_circles: [],
    suggested_circles: [],
    rails: {
      trusted_groups: [],
      premium_inner: [],
      portfolio_related: [],
      strategy_fit: [],
      macro_private: [],
      active_communities: [],
    },
    private_feed: [],
    publishing: {
      upload_href: "/hub/upload",
      composer_hint: "Yakın çevreye özel içerik için yayınla sekmesini kullan.",
    },
    nav: { ...NAV },
    data_mode: "live_sparse",
    write_enabled: isCloseFriendsWriteEnabled(),
  };
}

export async function fetchCloseFriendsHubLive(
  client: SupabaseClient,
  viewerId: string | null,
): Promise<CloseFriendsHubPayload> {
  if (!viewerId) {
    return buildEmptyCloseFriendsHubPayload();
  }

  const { members, profiles } = await fetchTrustedMembers(client, viewerId);
  const your_circles = circlesFromFriends(profiles);
  const suggested_circles: CloseFriendsHubPayload["suggested_circles"] = [];
  const rails = buildCircleRails([...your_circles, ...suggested_circles]);
  const writeOn = isCloseFriendsWriteEnabled();
  const hasData = members.length > 0;

  return {
    headline: "Yakın Arkadaşlar",
    subline: hasData
      ? writeOn
        ? "Güven katmanını yönetebilir, dairelerine özel akışı takip edebilirsin."
        : "Liste canlı — ekleme/çıkarma salt-okuma modunda kapalı (NEXT_PUBLIC_WEB_WRITE_ENABLED)."
      : "Henüz yakın arkadaş eklemedin. Ayarlardan veya kanallardan çekirdek üreticilerini seç.",
    affinity_line: hasData
      ? `${members.length} güvenilir üye · ${your_circles.length} daire`
      : "Yakın takip listesi boş — özel daireler burada oluşur.",
    trusted_members: members,
    your_circles,
    suggested_circles,
    rails,
    private_feed: [],
    publishing: {
      upload_href: "/hub/upload",
      composer_hint: hasData
        ? "Yakın çevreye özel gönderi için Upload → kitle segmenti seç."
        : "Önce yakın arkadaş ekle, sonra özel yayın yap.",
    },
    nav: { ...NAV },
    data_mode: hasData ? "live" : "live_sparse",
    write_enabled: writeOn,
  };
}
