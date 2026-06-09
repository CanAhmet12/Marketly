import type {
  CloseFriendsHubPayload,
  ComposerCircleAudienceOption,
  PrivateCircleDetailPayload,
  PrivateCircleIntel,
} from "../domain/types";

import type { CloseFriendsRepository } from "./close-friends-repository";

const NAV = {
  subscriptions: "/hub/subscriptions",
  messages: "/hub/messages",
  notifications: "/hub/notifications",
  discover: "/discover",
  watch: "/watch",
} as const;

function emptyIntel(): PrivateCircleIntel {
  return {
    member_activity_label: "—",
    creator_participation_label: "—",
    private_engagement_label: "—",
    discussion_density_label: "—",
    premium_participation_label: "—",
    invite_momentum_label: "—",
    trust_heat_label: "—",
    member_overlap_label: "—",
  };
}

export class SupabaseCloseFriendsRepository implements CloseFriendsRepository {
  getPrivateCirclesHub(_viewerId: string | null): CloseFriendsHubPayload {
    void _viewerId;
    return {
      headline: "Özel daireler",
      subline: "Canlı modda yakın takipçi ve davetli masalar sunucuya bağlandığında burada görünecek.",
      affinity_line: "Kişiselleştirme açıldığında önerilen özel topluluklar listelenecek.",
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
      publishing: { upload_href: "/upload", composer_hint: "Yayın hedef kitlesi canlı modda yapılandırılacak." },
      nav: { ...NAV },
      data_mode: "live_sparse",
    };
  }

  getCircleDetail(circleId: string, _viewerId: string | null): PrivateCircleDetailPayload | null {
    void _viewerId;
    if (!circleId.trim()) return null;
    const [creatorId, kind] = circleId.split("::");
    if (!creatorId || !kind) return null;
    return {
      circle: {
        id: circleId,
        creator_id: creatorId,
        creator_display: "Üretici",
        creator_handle: "@",
        avatar_url: null,
        verified: false,
        kind: "creator_selected",
        title: "Özel daire",
        subline: "Detay canlı modda doldurulacak.",
        access: {
          mode: "invite_only",
          label: "Davetli",
          locked: true,
          role_hint: null,
          temporary_hint: null,
        },
        intel: emptyIntel(),
        href: `/close-friends/circle/${encodeURIComponent(circleId)}`,
        subscription_href: `/subscriptions/${encodeURIComponent(creatorId)}`,
        signals_href: "/signals",
        rooms_href: `/channel/${encodeURIComponent(creatorId)}?tab=rooms`,
        messages_href: "/hub/messages",
      },
      feed: [],
      publishing_hint: "Kitle seçimi yakında.",
    };
  }

  getComposerCircleAudiences(_publisherUserId: string): ComposerCircleAudienceOption[] {
    void _publisherUserId;
    return [
      { id: "public", label: "Genel akış", sub: "Tüm takipçiler (varsayılan)", locked: false, href_learn: "/subscriptions" },
    ];
  }
}
