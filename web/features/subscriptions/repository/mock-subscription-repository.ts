import { getHomeRepository } from "@/features/home/repository";
import { getMarketsRepository } from "@/features/markets/repository";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSignalsRepository } from "@/features/signals/repository";
import { signalAccessLabel } from "@/features/signals/domain/signal-economy";
import { getSocialRepository } from "@/features/social/repository";
import type { RecommendedCreatorCard } from "@/features/home/types";
import { getMockFollowingCreatorIds } from "@/mock/fixtures/follows";
import { MOCK_PROFILE_BY_ID } from "@/mock/fixtures/profiles";

import type {
  ActiveMembershipRow,
  CreatorEconomyIntel,
  MembershipDetailPayload,
  MembershipDiscoveryCard,
  MembershipDiscoveryRails,
  MembershipRecommendationReason,
  MembershipTierDefinition,
  MembershipTierKey,
  SubscriptionsHubPayload,
  TierAccessFlags,
} from "../domain/types";

import type { SubscriptionRepository } from "./subscription-repository";

const NAV = {
  signals: "/signals",
  discover: "/discover",
  watch: "/watch",
  markets: "/markets",
} as const;

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function thesisFrom(card: RecommendedCreatorCard): string {
  const raw = (card.bio ?? card.expertise ?? "").trim();
  if (!raw) return "Disiplinli süreç ve şeffaf risk çerçevesi.";
  const cut = raw.split(/(?<=[.!?])\s+/)[0] ?? raw;
  return cut.length > 120 ? `${cut.slice(0, 118)}…` : cut;
}

function macroVsFrom(card: RecommendedCreatorCard, h: number): "macro" | "momentum" | "balanced" {
  const blob = `${card.expertise} ${card.bio ?? ""}`.toLowerCase();
  if (/makro|fed|faiz|tahvil|fx|kur\b|cpi|pmi/.test(blob)) return "macro";
  if (/momentum|scalp|intraday|volatil|kısa\s*vade|hızlı/.test(blob)) return "momentum";
  return h % 3 === 0 ? "macro" : h % 3 === 1 ? "momentum" : "balanced";
}

function accessForTier(key: MembershipTierKey): TierAccessFlags {
  const none: TierAccessFlags = {
    rooms: "none",
    signals: "none",
    discussions: "none",
    watchlists: "none",
    live: "none",
    research: "none",
    archives: "none",
    notes: "none",
  };
  const preview: TierAccessFlags = {
    rooms: "preview",
    signals: "preview",
    discussions: "preview",
    watchlists: "none",
    live: "preview",
    research: "none",
    archives: "none",
    notes: "none",
  };
  const premium: TierAccessFlags = {
    rooms: "preview",
    signals: "full",
    discussions: "full",
    watchlists: "preview",
    live: "full",
    research: "preview",
    archives: "preview",
    notes: "preview",
  };
  const elite: TierAccessFlags = {
    rooms: "full",
    signals: "full",
    discussions: "full",
    watchlists: "full",
    live: "full",
    research: "full",
    archives: "full",
    notes: "full",
  };
  switch (key) {
    case "free":
      return { ...none, discussions: "preview", signals: "preview" };
    case "premium":
      return premium;
    case "elite":
    case "institutional":
      return elite;
    case "private_room":
      return { ...elite, rooms: "full", signals: "preview" };
    case "strategy_club":
      return { ...elite, research: "full", notes: "full", archives: "full" };
    case "macro_research":
      return { ...elite, research: "full", discussions: "full" };
    case "signal_desk":
      return { ...elite, signals: "full", archives: "full" };
    default:
      return preview;
  }
}

function buildTiers(row: RecommendedCreatorCard, h: number): MembershipTierDefinition[] {
  const tierRank = (row.tier ?? "").toLowerCase();
  const hasElite = tierRank === "elite" || h % 4 === 0;
  const hasInst = hasElite && h % 5 === 0;

  const pool: MembershipTierKey[] = ["free", "premium"];
  if (hasElite) pool.push("elite");
  if (hasInst) pool.push("institutional");
  if (h % 2 === 0) pool.push("strategy_club");
  if (h % 3 === 0) pool.push("macro_research");
  if (h % 2 === 1) pool.push("signal_desk");
  if (h % 7 === 0) pool.push("private_room");

  const labels: Record<MembershipTierKey, string> = {
    free: "Topluluk",
    premium: "Premium",
    elite: "Elite",
    institutional: "Kurumsal masa",
    private_room: "Özel oda",
    strategy_club: "Strateji kulübü",
    macro_research: "Makro masa",
    signal_desk: "Sinyal masası",
  };

  const pitches: Record<MembershipTierKey, string> = {
    free: "Geniş akış, sınırlı önizleme ve herkese açık tartışmalar.",
    premium: "Kilitli sinyaller, yoğun tartışmalar ve canlı özetler.",
    elite: "Tüm odalar, arşiv ve strateji notları — tek üretici ekosistemi.",
    institutional: "Kurumsal tempo: risk çerçevesi, arşiv ve özel masa ritmi.",
    private_room: "Dar kapsamlı oda + doğrudan üretici güncellemeleri.",
    strategy_club: "Haftalık strateji özeti ve pozisyon gerekçeleri.",
    macro_research: "Makro harita + varlık zinciri okumaları.",
    signal_desk: "Sinyal masası, arşiv ve kopya istatistikleri.",
  };

  const uniq = [...new Set(pool)];

  return uniq.map((key) => {
    const profile = MOCK_PROFILE_BY_ID[row.id];
    const price =
      key === "free"
        ? null
        : key === "premium"
          ? profile?.subscription_price ?? (39 + (h % 5) * 8)
          : key === "elite"
            ? (profile?.subscription_price ?? 49) + 40 + (h % 4) * 10
            : 120 + (h % 6) * 20;
    return {
      key,
      label: labels[key],
      pitch: pitches[key],
      monthly_hint: price == null ? null : `≈ ₺${price} / ay · mock`,
      access: accessForTier(key),
      highlight: key === "premium" || (hasElite && key === "elite"),
    };
  });
}

function buildIntel(
  row: RecommendedCreatorCard,
  roomsPremiumCount: number,
  signalRows: number,
  discussionHeat: string,
  h: number,
): CreatorEconomyIntel {
  const sub = MOCK_PROFILE_BY_ID[row.id]?.subscriber_count ?? Math.max(120, Math.round(row.follower_count / 140));
  const mom = sub > 1500 ? "Abone ivmesi güçlü" : sub > 600 ? "Abone ivmesi istikrarlı" : "Abone tabanı büyüyor";
  const eng =
    roomsPremiumCount >= 2 ? "Premium katılım yoğun" : roomsPremiumCount === 1 ? "Premium katılım seçici" : "Premium katılım kontrollü";
  const acc = MOCK_PROFILE_BY_ID[row.id]?.signal_accuracy ?? 58 + (h % 18);
  return {
    subscriber_momentum_label: mom,
    premium_engagement_label: eng,
    consistency_label: h % 2 === 0 ? "Yayın disiplini yüksek" : "Haftalık tempo korunuyor",
    premium_hit_rate_label: `Son dönem isabet ${acc}% bandı`,
    institutional_confidence_label: row.follower_count > 180_000 ? "Kurumsal güven yüksek" : "Kurumsal güven olgunlaşıyor",
    room_participation_label: discussionHeat,
    strategy_quality_label: row.verified ? "Strateji çerçevesi net" : "Strateji çerçevesi gelişiyor",
    premium_activity_heat_label: signalRows >= 4 ? "Premium aktivite sıcak" : signalRows >= 2 ? "Premium aktivite ılık" : "Premium aktivite seçici",
  };
}

function portfolioOverlapScore(
  creatorSymbols: Set<string>,
  portfolio: Set<string>,
  watched: Set<string>,
): number {
  let s = 0;
  for (const x of creatorSymbols) {
    if (portfolio.has(x)) s += 2.2;
    if (watched.has(x)) s += 1.1;
  }
  return s;
}

function relLabel(kind: MembershipRecommendationReason): string {
  const map: Record<MembershipRecommendationReason, string> = {
    interest_fit: "Sana uygun olabilir",
    portfolio_overlap: "Portföyünle ilişkili",
    macro_affinity: "Makro ilgine yakın",
    momentum_fit: "Momentum stratejine uygun",
    room_activity: "Oda trafiği güçlü",
    signal_quality: "Sinyal kalitesi öne çıkıyor",
    rising_premium: "Yükselen premium",
    institutional_style: "Kurumsal tempo",
    strategy_club: "Strateji kulübü hattı",
    copied_signals: "Kopyalanan çağrılarla örtüşüyor",
  };
  return map[kind];
}

function toDiscoveryCard(
  row: RecommendedCreatorCard,
  extras: {
    rel_kind: MembershipRecommendationReason;
    tier_keys: MembershipTierKey[];
    intel: CreatorEconomyIntel;
    heat_score: number;
    macro_vs_momentum: "macro" | "momentum" | "balanced";
  },
): MembershipDiscoveryCard {
  return {
    creator_id: row.id,
    display_name: row.name,
    handle: row.handle.startsWith("@") ? row.handle : `@${row.handle.replace(/^@/, "")}`,
    avatar_url: row.avatar_url,
    verified: row.verified,
    thesis_line: thesisFrom(row),
    strategy_focus_label: row.expertise.split("·")[0]?.trim() || "Çok varlıklı disiplin",
    timeframe_label: MOCK_PROFILE_BY_ID[row.id]?.strategy_style ?? "Swing / orta vade",
    macro_vs_momentum: extras.macro_vs_momentum,
    rel_label: relLabel(extras.rel_kind),
    rel_kind: extras.rel_kind,
    tier_keys: extras.tier_keys,
    intel: extras.intel,
    href_detail: `/subscriptions/${encodeURIComponent(row.id)}`,
    href_channel: `/channel/${encodeURIComponent(row.id)}`,
    heat_score: extras.heat_score,
  };
}

export class MockSubscriptionRepository implements SubscriptionRepository {
  getSubscriptionsHub(viewerId: string | null): SubscriptionsHubPayload {
    const creators = getHomeRepository().getRecommendedCreators();
    const p = getPersonalizationRepository();
    const bundle = p.getRecommendationNetworkBundle(viewerId, null);
    const affinity = p.getAffinityContext();
    const m = getMarketsRepository();
    const watched = new Set((m.getWatchlistSeed() ?? []).map((x) => String(x).toUpperCase()));
    const portfolio = new Set(m.getPortfolioIntelligenceBundle().portfolioSymbols.map((x) => String(x).toUpperCase()));
    const sigRepo = getSignalsRepository();
    const rows = sigRepo.getFeedRows();
    const social = getSocialRepository();
    const discPack = social.getPersonalizedDiscussionRecommendations({
      viewerId,
      watchedSymbols: [...watched],
      portfolioSymbols: [...portfolio],
      followedCreatorIds: getMockFollowingCreatorIds(viewerId),
    });

    const followed = new Set(getMockFollowingCreatorIds(viewerId));

    const enriched: MembershipDiscoveryCard[] = creators.map((c) => {
      const creatorHash = hashId(c.id);
      const creatorSyms = new Set<string>();
      for (const r of rows) {
        if (r.analyst.id === c.id && r.symbol) creatorSyms.add(String(r.symbol).toUpperCase());
      }
      const rooms = social.getCreatorCommunityRoomsSurface(c.id);
      const premRooms = rooms.rooms.filter((x) => x.is_premium).length;
      const sigN = rows.filter((r) => r.analyst.id === c.id).length;
      const heat = Math.min(1, premRooms * 0.12 + sigN * 0.07 + (c.follower_count > 200_000 ? 0.15 : 0.05));
      const intel = buildIntel(c, premRooms, sigN, rooms.intelligence.premium_participation_label, creatorHash);
      const tiers = buildTiers(c, creatorHash);
      const tier_keys = tiers.map((t) => t.key);
      const macroM = macroVsFrom(c, creatorHash);

      const portScore = portfolioOverlapScore(creatorSyms, portfolio, watched);
      const affScore = affinity.creators[c.id] ?? 0;

      let rel: MembershipRecommendationReason = "interest_fit";
      if (portScore >= 2) rel = "portfolio_overlap";
      else if (macroM === "macro" && bundle.strategyHints.macroVsMomentum === "macro") rel = "macro_affinity";
      else if (macroM === "momentum" && bundle.strategyHints.macroVsMomentum === "momentum") rel = "momentum_fit";
      else if (premRooms >= 2) rel = "room_activity";
      else if (sigN >= 5) rel = "signal_quality";
      else if (affScore > 2) rel = "copied_signals";

      return toDiscoveryCard(c, {
        rel_kind: rel,
        tier_keys,
        intel,
        heat_score: heat,
        macro_vs_momentum: macroM,
      });
    });

    const sortHeat = (a: MembershipDiscoveryCard, b: MembershipDiscoveryCard) => b.heat_score - a.heat_score;
    const sortFollowers = (a: MembershipDiscoveryCard, b: MembershipDiscoveryCard) => {
      const fa = creators.find((x) => x.id === a.creator_id)?.follower_count ?? 0;
      const fb = creators.find((x) => x.id === b.creator_id)?.follower_count ?? 0;
      return fb - fa;
    };

    const recommended_for_you = [...enriched]
      .sort((a, b) => {
        const ra = a.rel_kind === "portfolio_overlap" ? 4 : a.rel_kind === "macro_affinity" || a.rel_kind === "momentum_fit" ? 3 : 1;
        const rb = b.rel_kind === "portfolio_overlap" ? 4 : b.rel_kind === "macro_affinity" || b.rel_kind === "momentum_fit" ? 3 : 1;
        if (rb !== ra) return rb - ra;
        return b.heat_score - a.heat_score;
      })
      .slice(0, 8);

    const rising_premium = [...enriched]
      .filter((x) => x.tier_keys.includes("elite") || x.tier_keys.includes("premium"))
      .sort(sortHeat)
      .slice(0, 6);

    const institutional_style = [...enriched]
      .filter((x) => {
        const fc = creators.find((c) => c.id === x.creator_id)?.follower_count ?? 0;
        return x.tier_keys.includes("institutional") || (x.tier_keys.includes("elite") && fc > 150_000);
      })
      .sort(sortFollowers)
      .slice(0, 5);

    const strategy_focused = [...enriched]
      .filter((x) => x.tier_keys.includes("strategy_club") || x.tier_keys.includes("signal_desk"))
      .sort(sortHeat)
      .slice(0, 6);

    const portfolio_aligned = [...enriched].filter((x) => x.rel_kind === "portfolio_overlap").sort(sortHeat).slice(0, 6);

    const premium_room_spotlight = [...enriched]
      .filter((x) => {
        const surf = social.getCreatorCommunityRoomsSurface(x.creator_id);
        return surf.rooms.some((r) => r.is_premium);
      })
      .sort(sortHeat)
      .slice(0, 6);

    const macro_desk = [...enriched].filter((x) => x.macro_vs_momentum === "macro").sort(sortHeat).slice(0, 6);

    const high_conviction = [...enriched]
      .sort((a, b) => {
        const ia = creators.find((c) => c.id === a.creator_id);
        const ib = creators.find((c) => c.id === b.creator_id);
        const sa = MOCK_PROFILE_BY_ID[ia?.id ?? ""]?.signal_accuracy ?? 50;
        const sb = MOCK_PROFILE_BY_ID[ib?.id ?? ""]?.signal_accuracy ?? 50;
        return sb - sa;
      })
      .slice(0, 6);

    const rails: MembershipDiscoveryRails = {
      recommended_for_you,
      rising_premium,
      institutional_style,
      strategy_focused,
      portfolio_aligned,
      premium_room_spotlight,
      macro_desk,
      high_conviction,
    };

    const active_memberships: ActiveMembershipRow[] = [...followed]
      .map((id) => {
        const card = creators.find((c) => c.id === id) ?? null;
        if (!card) return null;
        const h = hashId(id);
        const tier = card.tier?.toLowerCase() === "elite" ? "Elite" : card.tier?.toLowerCase() === "pro" ? "Premium" : "Üyelik";
        return {
          creator_id: id,
          display_name: card.name,
          handle: card.handle.startsWith("@") ? card.handle : `@${card.handle}`,
          tier_label: tier,
          renew_hint: h % 3 === 0 ? "Yenileme penceresi açık (mock)" : null,
          href_detail: `/subscriptions/${encodeURIComponent(id)}`,
          href_channel: `/channel/${encodeURIComponent(id)}`,
        };
      })
      .filter(Boolean) as ActiveMembershipRow[];

    const premiumCirc =
      enriched.filter((x) => x.tier_keys.includes("premium") || x.tier_keys.includes("elite")).length >= 4
        ? "Premium dolaşım geniş — çoklu masa ve sinyal hattı aktif."
        : "Premium dolaşım seçici — odaklı üreticiler öne çıkıyor.";

    return {
      headline: "Creator üyelik merkezi",
      subline:
        "Sinyal masası, premium odalar ve strateji notları tek çatı altında. Abonelik kararını bağlam ve disipline göre ver.",
      affinity_line: bundle.affinity_line,
      cold_start: bundle.coldStart,
      strategy_profile_label: bundle.strategyHints.label,
      active_memberships,
      catalog: enriched.sort(sortHeat),
      rails,
      platform_intel: {
        premium_circulation_label: premiumCirc,
        room_desk_label: `${discPack.room_suggestions.length + rails.premium_room_spotlight.length} premium oda ipucu · mock`,
        signal_archive_label: `${rows.filter((r) => r.signal_access !== "public").length} kilitli çağrı dolaşımda`,
      },
      nav: { ...NAV },
      data_mode: "mock",
    };
  }

  getMembershipDetail(creatorId: string, viewerId: string | null): MembershipDetailPayload | null {
    void viewerId;
    const trimmed = creatorId.trim();
    if (!trimmed) return null;

    const creators = getHomeRepository().getRecommendedCreators();
    const card = creators.find((c) => c.id === trimmed) ?? null;
    const profile = MOCK_PROFILE_BY_ID[trimmed];
    if (!card && !profile) return null;

    const row: RecommendedCreatorCard = card ?? {
      id: profile!.id,
      name: profile!.full_name ?? profile!.username,
      handle: `@${profile!.username}`,
      avatar_url: profile!.avatar_url,
      bio: profile!.bio,
      verified: profile!.verified,
      tier: profile!.tier,
      follower_count: profile!.follower_count,
      expertise: profile!.bio?.trim() ? (profile!.bio!.length > 96 ? `${profile!.bio!.slice(0, 94)}…` : profile!.bio!) : "Piyasa disiplini",
    };

    const h = hashId(trimmed);
    const tiers = buildTiers(row, h);
    const social = getSocialRepository();
    const rooms = social.getCreatorCommunityRoomsSurface(trimmed);
    const sigRepo = getSignalsRepository();
    const sigRows = sigRepo.getFeedRows().filter((r) => r.analyst.id === trimmed).slice(0, 5);

    const premRooms = rooms.rooms.filter((x) => x.is_premium).length;
    const intel = buildIntel(row, premRooms, sigRows.length, rooms.intelligence.premium_participation_label, h);

    const room_previews = rooms.rooms.slice(0, 4).map((r) => ({
      id: r.id,
      label: r.label,
      kind_label: r.kind.replace(/_/g, " "),
      heat_label: r.heat_label,
      href: r.href,
      premium: r.is_premium,
    }));

    const discussion_previews = rooms.feed
      .filter((f) => f.kind === "thread" || f.kind === "qa" || f.kind === "highlight")
      .slice(0, 4)
      .map((f) => ({
        id: f.id,
        label: f.title,
        sub: f.sub,
        href: f.href,
      }));

    const signal_previews = sigRows.map((r) => ({
      id: r.id,
      symbol: r.symbol,
      direction: r.direction,
      thesis_snippet: (r.rationale ?? "").trim().slice(0, 96) || `${r.asset_display_name} · ${r.timeframe}`,
      access_label: signalAccessLabel(r.signal_access),
      href: r.detail_href,
    }));

    const activity_timeline: MembershipDetailPayload["activity_timeline"] = rooms.feed.slice(0, 6).map((f) => ({
      id: f.id,
      at: f.created_at,
      title: f.title,
      sub: f.sub,
      href: f.href,
    }));

    const unlocks_editorial = [
      tiers.some((t) => t.access.rooms === "full") ? "Tüm premium odalara tam erişim" : "Premium odalarda geniş önizleme",
      tiers.some((t) => t.access.signals === "full") ? "Sinyal masası ve kilitli çağrılar" : "Sinyal önizlemeleri + seçili tam çağrılar",
      tiers.some((t) => t.access.discussions === "full") ? "Üretici tartışmalarında öncelikli sıra" : "Tartışma katılımı seçili kanallarda",
      tiers.some((t) => t.access.research === "full") ? "Makro / strateji notları ve haftalık özet" : "Araştırma notlarında sınırlı önizleme",
      tiers.some((t) => t.access.archives === "full") ? "Arşiv masası — geçmiş çağrılar" : "Arşiv erişimi kademeli",
    ];

    return {
      creator_id: trimmed,
      display_name: row.name,
      handle: row.handle.startsWith("@") ? row.handle : `@${row.handle}`,
      avatar_url: row.avatar_url,
      verified: row.verified,
      overview: thesisFrom(row),
      strategy_summary: MOCK_PROFILE_BY_ID[trimmed]?.strategy_style ?? row.expertise,
      tiers,
      intel,
      unlocks_editorial,
      room_previews,
      discussion_previews,
      signal_previews,
      activity_timeline,
      archive_hint: "Premium arşiv segmentleri sinyal masası ile birlikte açılır (mock).",
      links: {
        channel: `/channel/${encodeURIComponent(trimmed)}`,
        signals: `/signals`,
        rooms_tab: `/channel/${encodeURIComponent(trimmed)}?tab=rooms`,
        discover: "/discover",
      },
    };
  }
}
