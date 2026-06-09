import { getHomeRepository } from "@/features/home/repository";
import { getMarketsRepository } from "@/features/markets/repository";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSignalsRepository } from "@/features/signals/repository";
import { getSocialRepository } from "@/features/social/repository";
import { MOCK_PROFILE_BY_ID } from "@/mock/fixtures/profiles";

import type {
  CloseFriendsHubPayload,
  ComposerCircleAudienceOption,
  PrivateCircleDetailPayload,
  PrivateCircleIntel,
  PrivateCircleKind,
  PrivateCircleSummary,
  PrivateFeedItem,
  TrustedMemberCard,
} from "../domain/types";

import type { CloseFriendsRepository } from "./close-friends-repository";

const NAV = {
  subscriptions: "/hub/subscriptions",
  messages: "/hub/messages",
  notifications: "/hub/notifications",
  discover: "/discover",
  watch: "/watch",
} as const;

const KIND_LABELS: Record<PrivateCircleKind, { title: string; sub: string }> = {
  close_followers: { title: "Yakın takipçiler", sub: "Hikâye ve dar kitle güncellemeleri" },
  premium_members: { title: "Premium üyeler", sub: "Abonelik masası ile hizalı içerik" },
  signal_desk: { title: "Sinyal masası", sub: "Kilitli çağrı ve arşiv güncellemeleri" },
  macro_club: { title: "Makro kulübü", sub: "Politika / veri odaklı özel oturumlar" },
  institutional_room: { title: "Kurumsal oda", sub: "Risk çerçevesi ve masa disiplini" },
  elite_subscribers: { title: "Elite aboneler", sub: "Dar daire · üretici seçkisi" },
  research_circle: { title: "Araştırma çemberi", sub: "Notlar, arşiv ve derinlemesine thread" },
  inner_strategy: { title: "İç strateji grubu", sub: "Pozisyon gerekçesi ve güven katmanı" },
  creator_selected: { title: "Üretici seçkisi", sub: "Davetli ve rol etiketli üyeler" },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function intelFor(creatorId: string, kind: PrivateCircleKind, h: number): PrivateCircleIntel {
  void kind;
  const p = MOCK_PROFILE_BY_ID[creatorId];
  const subc = p?.subscriber_count ?? 400 + (h % 800);
  return {
    member_activity_label: subc > 1200 ? "Üye aktivitesi yoğun" : "Üye aktivitesi kontrollü",
    creator_participation_label: p?.verified ? "Üretici katılımı yüksek" : "Üretici katılımı istikrarlı",
    private_engagement_label: h % 2 === 0 ? "Özel etkileşim kalitesi güçlü" : "Özel etkileşim seçici",
    discussion_density_label: h % 3 === 0 ? "Tartışma yoğunluğu yüksek" : "Tartışma derinliği korunuyor",
    premium_participation_label: "Premium katılım dengeli",
    invite_momentum_label: h % 4 === 0 ? "Davet ivmesi artıyor" : "Davet tabanı olgun",
    trust_heat_label: h % 5 === 0 ? "Güven ısısı sıcak" : "Güven ısısı ılık",
    member_overlap_label: "Üye örtüşmesi düşük — dar daire",
  };
}

function accessFor(kind: PrivateCircleKind, h: number): PrivateCircleSummary["access"] {
  const locked = kind === "inner_strategy" || kind === "creator_selected" || (kind === "elite_subscribers" && h % 7 === 0);
  const mode =
    kind === "inner_strategy" || kind === "creator_selected"
      ? ("invite_only" as const)
      : kind === "premium_members" || kind === "elite_subscribers"
        ? ("membership" as const)
        : kind === "institutional_room"
          ? ("strategy_tier" as const)
          : kind === "signal_desk" || kind === "macro_club"
            ? ("premium_room" as const)
            : h % 11 === 0
              ? ("temporary" as const)
              : ("creator_selected" as const);
  return {
    mode,
    label:
      mode === "invite_only"
        ? "Davet + rol"
        : mode === "membership"
          ? "Üyelik kademesi"
          : mode === "strategy_tier"
            ? "Strateji masası"
            : mode === "premium_room"
              ? "Premium oda erişimi"
              : mode === "temporary"
                ? "Süreli erişim"
                : "Üretici seçimi",
    locked,
    role_hint: locked ? "Güvenilir üye" : null,
    temporary_hint: mode === "temporary" ? "48s içinde oturum kilidi (mock)" : null,
  };
}

function makeCircle(creatorId: string, kind: PrivateCircleKind): PrivateCircleSummary {
  const p = MOCK_PROFILE_BY_ID[creatorId];
  const h = hash(`${creatorId}::${kind}`);
  const meta = KIND_LABELS[kind];
  const name = p?.full_name ?? p?.username ?? "Üretici";
  const handle = p ? `@${p.username}` : "@creator";
  return {
    id: `${creatorId}::${kind}`,
    creator_id: creatorId,
    creator_display: name,
    creator_handle: handle,
    avatar_url: p?.avatar_url ?? null,
    verified: p?.verified ?? false,
    kind,
    title: `${name.split(" ")[0] ?? name} · ${meta.title}`,
    subline: meta.sub,
    access: accessFor(kind, h),
    intel: intelFor(creatorId, kind, h),
    href: `/close-friends/circle/${encodeURIComponent(`${creatorId}::${kind}`)}`,
    subscription_href: `/subscriptions/${encodeURIComponent(creatorId)}`,
    signals_href: "/signals",
    rooms_href: `/channel/${encodeURIComponent(creatorId)}?tab=rooms`,
    messages_href: "/hub/messages",
  };
}

function kindsForMember(h: number): [PrivateCircleKind, PrivateCircleKind] {
  const pool: PrivateCircleKind[] = [
    "close_followers",
    "premium_members",
    "signal_desk",
    "macro_club",
    "inner_strategy",
    "research_circle",
  ];
  return [pool[h % pool.length]!, pool[(h + 3) % pool.length]!];
}

function scorePortfolioOverlap(creatorId: string, port: Set<string>, watch: Set<string>): number {
  let s = 0;
  for (const r of getSignalsRepository().getFeedRows()) {
    if (r.analyst.id !== creatorId || !r.symbol) continue;
    const sym = String(r.symbol).toUpperCase();
    if (port.has(sym)) s += 2;
    if (watch.has(sym)) s += 1;
  }
  return s;
}

export class MockCloseFriendsRepository implements CloseFriendsRepository {
  getPrivateCirclesHub(viewerId: string | null): CloseFriendsHubPayload {
    void viewerId;
    const social = getSocialRepository();
    const uid = viewerId ?? "mock-viewer";
    const friends = social.getCloseFriends(uid);
    const bundle = getPersonalizationRepository().getRecommendationNetworkBundle(viewerId, null);
    const m = getMarketsRepository();
    const watched = new Set((m.getWatchlistSeed() ?? []).map((x) => String(x).toUpperCase()));
    const portfolio = new Set(m.getPortfolioIntelligenceBundle().portfolioSymbols.map((x) => String(x).toUpperCase()));
    const creators = getHomeRepository().getRecommendedCreators();
    const closeSet = new Set(friends.map((f) => f.id));

    const trusted_members: TrustedMemberCard[] = friends.map((f, i) => ({
      id: f.id,
      username: f.username,
      full_name: f.full_name,
      avatar_url: f.avatar_url,
      verified: f.verified,
      trust_line: i % 2 === 0 ? "Çekirdek güven katmanı" : "Özel yayın dairesinde",
      channel_href: `/channel/${encodeURIComponent(f.id)}`,
    }));

    const your_circles: PrivateCircleSummary[] = [];
    for (const f of friends) {
      const [a, b] = kindsForMember(hash(f.id));
      if (a !== b) {
        your_circles.push(makeCircle(f.id, a), makeCircle(f.id, b));
      } else {
        your_circles.push(makeCircle(f.id, a));
      }
    }

    const suggested_circles: PrivateCircleSummary[] = [];
    for (const c of creators) {
      if (closeSet.has(c.id)) continue;
      const k = (["premium_members", "macro_club", "signal_desk", "elite_subscribers"] as const)[hash(c.id) % 4]!;
      suggested_circles.push(makeCircle(c.id, k));
      if (suggested_circles.length >= 10) break;
    }

    const all = [...your_circles, ...suggested_circles];
    const uniq = [...new Map(all.map((x) => [x.id, x])).values()];

    const trusted_groups = uniq.filter((x) => x.kind === "close_followers" || x.kind === "inner_strategy").slice(0, 8);
    const premium_inner = uniq.filter((x) =>
      ["premium_members", "elite_subscribers", "signal_desk"].includes(x.kind),
    ).slice(0, 8);
    const portfolio_related = [...uniq]
      .sort((a, b) => scorePortfolioOverlap(b.creator_id, portfolio, watched) - scorePortfolioOverlap(a.creator_id, portfolio, watched))
      .slice(0, 6);
    const strategy_fit = uniq.filter((x) => x.kind === "inner_strategy" || x.kind === "signal_desk").slice(0, 6);
    const macro_private = uniq.filter((x) => x.kind === "macro_club" || x.kind === "institutional_room").slice(0, 6);
    const active_communities = [...uniq].sort((a, b) => hash(b.id) % 97 - (hash(a.id) % 97)).slice(0, 6);

    const private_feed: PrivateFeedItem[] = [];
    const sigRows = getSignalsRepository().getFeedRows();
    for (const f of friends) {
      for (const r of sigRows.filter((row) => row.analyst.id === f.id).slice(0, 2)) {
        private_feed.push({
          id: `pf-sig-${r.id}`,
          kind: "signal_preview",
          title: `${r.symbol} · ${r.direction}`,
          sub: (r.rationale ?? "").trim().slice(0, 120) || "Özel masa önizlemesi",
          href: r.detail_href,
          at: r.created_at,
          circle_id: `${f.id}::signal_desk`,
          trust_line: "Sinyal masası · güvenilir üye",
        });
      }
    }
    const disc = social.getDiscussionDiscoverySurface();
    for (const row of [...disc.rising, ...disc.trending].slice(0, 5)) {
      private_feed.push({
        id: `pf-d-${row.post_id}`,
        kind: "discussion",
        title: row.title,
        sub: row.reason,
        href: row.href,
        at: new Date().toISOString(),
        circle_id: null,
        trust_line: "Kısıtlı tartışma · öneri ağı",
      });
    }
    if (friends[0]) {
      const rooms = social.getCreatorCommunityRoomsSurface(friends[0].id);
      for (const fr of rooms.feed.slice(0, 4)) {
        private_feed.push({
          id: `pf-room-${fr.id}`,
          kind: "room_activity",
          title: fr.title,
          sub: fr.sub,
          href: fr.href,
          at: fr.created_at,
          circle_id: `${friends[0].id}::research_circle`,
          trust_line: "Oda içi · üye önceliği",
        });
      }
    }
    private_feed.sort((a, b) => (a.at < b.at ? 1 : -1));

    return {
      headline: "Özel daireler & yakın takip",
      subline:
        "Davetli masalar, üyelik hizalı içerik ve güven katmanı. Burası gürültüsüz, üretici-odaklı özel ağın.",
      affinity_line: bundle.affinity_line,
      trusted_members,
      your_circles,
      suggested_circles,
      rails: {
        trusted_groups,
        premium_inner,
        portfolio_related,
        strategy_fit,
        macro_private,
        active_communities,
      },
      private_feed: private_feed.slice(0, 24),
      publishing: {
        upload_href: "/upload",
        composer_hint: "Yayını yalnızca seçili daireye gönder — özet panelinde hedef kitle görünür.",
      },
      nav: { ...NAV },
      data_mode: "mock",
    };
  }

  getCircleDetail(circleId: string, viewerId: string | null): PrivateCircleDetailPayload | null {
    void viewerId;
    const raw = decodeURIComponent(circleId).trim();
    const sep = raw.indexOf("::");
    if (sep < 1) return null;
    const creatorId = raw.slice(0, sep);
    const kind = raw.slice(sep + 2) as PrivateCircleKind;
    if (!MOCK_PROFILE_BY_ID[creatorId]) return null;
    const valid: PrivateCircleKind[] = [
      "close_followers",
      "premium_members",
      "signal_desk",
      "macro_club",
      "institutional_room",
      "elite_subscribers",
      "research_circle",
      "inner_strategy",
      "creator_selected",
    ];
    if (!valid.includes(kind)) return null;
    const circle = makeCircle(creatorId, kind);
    const feed: PrivateFeedItem[] = [];
    const social = getSocialRepository();
    const rooms = social.getCreatorCommunityRoomsSurface(creatorId);
    for (const fr of rooms.feed.slice(0, 6)) {
      feed.push({
        id: `cd-${fr.id}`,
        kind: fr.kind === "announcement" ? "announcement" : "room_activity",
        title: fr.title,
        sub: fr.sub,
        href: fr.href,
        at: fr.created_at,
        circle_id: circle.id,
        trust_line: "Daire içi",
      });
    }
    for (const r of getSignalsRepository()
      .getFeedRows()
      .filter((x) => x.analyst.id === creatorId)
      .slice(0, 4)) {
      feed.push({
        id: `cd-sig-${r.id}`,
        kind: "signal_preview",
        title: `${r.symbol} · ${r.direction}`,
        sub: (r.rationale ?? "").trim().slice(0, 100),
        href: r.detail_href,
        at: r.created_at,
        circle_id: circle.id,
        trust_line: "Masaya özel",
      });
    }
    feed.sort((a, b) => (a.at < b.at ? 1 : -1));
    return {
      circle,
      feed: feed.slice(0, 12),
      publishing_hint: "Bu daireye yayın: yükleme ekranında kitle olarak seç.",
    };
  }

  getComposerCircleAudiences(publisherUserId: string): ComposerCircleAudienceOption[] {
    const base: ComposerCircleAudienceOption[] = [
      { id: "public", label: "Genel akış", sub: "Tüm takipçiler", locked: false, href_learn: null },
    ];
    const profile = MOCK_PROFILE_BY_ID[publisherUserId];
    if (!profile) {
      return [
        ...base,
        {
          id: "self::close",
          label: "Yakın daire (şablon)",
          sub: "Üretici profili eşleşince aktifleşir",
          locked: true,
          href_learn: "/settings",
        },
      ];
    }
    const owned: ComposerCircleAudienceOption[] = (
      ["close_followers", "premium_members", "signal_desk", "inner_strategy"] as const
    ).map((kind) => ({
      id: `${publisherUserId}::${kind}`,
      label: KIND_LABELS[kind].title,
      sub: "Yalnızca bu daire üyeleri",
      locked: false,
      href_learn: `/close-friends/circle/${encodeURIComponent(`${publisherUserId}::${kind}`)}`,
    }));
    return [...base, ...owned];
  }
}
