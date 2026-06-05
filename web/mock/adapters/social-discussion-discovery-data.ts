import type { AffinityContext } from "@/features/personalization/domain/personalization-types";
import type {
  CreatorDiscussionGravityRow,
  DiscussionDiscoveryRow,
  DiscussionDiscoverySurface,
  DiscussionIntelMetrics,
  DiscussionRecommendationChip,
  DiscussionThreadNetwork,
  DiscussionThreadNetworkNode,
  PersonalizedDiscussionInput,
  PersonalizedDiscussionPack,
  PersonalizedDiscussionRow,
} from "@/features/social/repository/discussion-discovery-types";

import { getMockDiscussionPostPool } from "./social-discussion-data";
import { getMockFollowingCreatorIds } from "../fixtures/follows";
import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";

type PoolPost = ReturnType<typeof getMockDiscussionPostPool>[number];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function metricsFor(p: PoolPost, seed: number): DiscussionIntelMetrics {
  const mom = Math.min(100, Math.round((p.comments * 4 + p.likes * 2 + (seed % 17)) / 3));
  const vel = `${8 + (seed % 20)}/sa`;
  const creators = 2 + (seed % 9);
  const qual: DiscussionIntelMetrics["engagement_quality"] = mom > 72 ? "high" : mom > 42 ? "mid" : "low";
  return {
    momentum: mom,
    participation_velocity: vel,
    creator_density: `${creators} üretici`,
    signal_overlap: p.asset_tag ? `${p.asset_tag} çağrıları` : "Sinyal nötr",
    market_overlap: p.asset_tag ? `#${p.asset_tag} likidite` : "Çapraz piyasa",
    thesis_split: `${52 + (seed % 28)}% olumlu eğilim`,
    engagement_quality: qual,
    network_propagation: seed % 2 === 0 ? "3 komşu başlık" : "5 komşu başlık",
  };
}

function rowFrom(p: PoolPost, tier: DiscussionDiscoveryRow["tier"], reason: string, i: number): DiscussionDiscoveryRow {
  const seed = hash(p.id + tier + String(i));
  const title = (p.title?.trim() || p.content.slice(0, 52)) + (p.content.length > 52 ? "…" : "");
  return {
    id: `disc-${tier}-${p.id}`,
    post_id: p.id,
    title,
    href: `/post/${p.id}`,
    asset_tag: p.asset_tag,
    reason,
    metrics: metricsFor(p, seed),
    tier,
  };
}

function sortedPool(): PoolPost[] {
  return [...getMockDiscussionPostPool()].sort((a, b) => b.comments + b.likes - (a.comments + a.likes));
}

export function buildDiscussionDiscoverySurface(): DiscussionDiscoverySurface {
  const pool = sortedPool();
  const trending = pool.slice(0, 5).map((p, i) => rowFrom(p, "trending", "Yüksek katılım + güncel etkileşim", i));
  const rising = pool
    .filter((_, i) => i % 3 === 1)
    .slice(0, 5)
    .map((p, i) => rowFrom(p, "rising", "Hızlanan yanıt hızı", i));
  const creator_active = pool
    .filter((p) => {
      const t = MOCK_PROFILE_BY_ID[p.user_id]?.tier;
      return t === "pro" || t === "elite";
    })
    .slice(0, 4)
    .map((p, i) => rowFrom(p, "creator_active", "Üretici yoğunluğu", i));
  const active_debates = pool
    .filter((p) => p.comments >= 12)
    .slice(0, 4)
    .map((p, i) => rowFrom(p, "debate", "Tez ayrışması / münazara", i));
  const market_moving = pool
    .filter((p) => p.asset_tag && ["BTC", "ETH", "THYAO", "GARAN", "XU100", "USDTRY"].includes(String(p.asset_tag).toUpperCase()))
    .slice(0, 5)
    .map((p, i) => rowFrom(p, "market_mover", "Varlık akışına bağlı tartışma", i));
  const signal_linked_chain = pool
    .filter((p) => p.asset_tag)
    .slice(3, 8)
    .map((p, i) => rowFrom(p, "signal_chain", "Sinyal zinciri ile kesişen başlık", i));
  const macro_chains = pool
    .filter((p) => /fed|faiz|enflasyon|makro|tcmb|viop/i.test(`${p.title ?? ""} ${p.content}`))
    .slice(0, 4)
    .map((p, i) => rowFrom(p, "macro", "Makro zincir devamı", i));
  const fast_growing = pool
    .sort((a, b) => b.comments - a.comments)
    .slice(6, 11)
    .map((p, i) => rowFrom(p, "fast_growing", "Kısa aralıkta yanıt artışı", i));

  return {
    headline: "Tartışma istihbaratı",
    subline: "Aktif başlıklar, makro zincirler ve sinyal kesişimleri — yüksek sinyal keşif.",
    trending,
    rising,
    creator_active,
    active_debates,
    market_moving,
    signal_linked_chain,
    macro_chains,
    fast_growing,
  };
}

function personalizeRow(p: PoolPost, reason: string, score: string, i: number): PersonalizedDiscussionRow {
  const label = (p.title?.trim() || p.content.slice(0, 44)) + (p.content.length > 44 ? "…" : "");
  return {
    id: `pdisc-${p.id}-${i}`,
    post_id: p.id,
    label,
    sub: `${p.comments} yanıt · ${p.asset_tag ? `#${p.asset_tag}` : "genel"}`,
    href: `/post/${p.id}`,
    relevance_reason: reason,
    score_label: score,
  };
}

function postAffinityScore(p: PoolPost, ctx: AffinityContext | null): number {
  const base = p.comments * 2.1 + p.likes * 1.2 + (p.asset_tag ? 2.4 : 0);
  if (!ctx || ctx.meta.eventCount < 2) return base;
  const sym = (p.asset_tag ?? "").toUpperCase();
  const a = ctx.assets[sym] ?? 0;
  const c = ctx.creators[p.user_id] ?? 0;
  const d = ctx.discussions[p.id] ?? 0;
  return base + a * 1.35 + c * 1.15 + d * 2.2;
}

export function buildPersonalizedDiscussionRecommendations(
  input: PersonalizedDiscussionInput,
  affinity: AffinityContext | null,
): PersonalizedDiscussionPack {
  const pool = sortedPool();
  const watch = [...input.watchedSymbols].map((s) => s.trim().toUpperCase()).filter(Boolean);
  const port = [...input.portfolioSymbols].map((s) => s.trim().toUpperCase()).filter(Boolean);
  const follow = input.followedCreatorIds.length
    ? [...input.followedCreatorIds]
    : input.viewerId
      ? getMockFollowingCreatorIds(input.viewerId)
      : [];

  const byWatch = watch.length
    ? pool.filter((p) => watch.includes((p.asset_tag ?? "").toUpperCase()))
    : pool.slice(0, 6);
  const watchlist = byWatch.slice(0, 5).map((p, i) => personalizeRow(p, "İzleme listenle sembol örtüşmesi", `${82 - i * 4}%`, i));

  const byFollow = follow.length ? pool.filter((p) => follow.includes(p.user_id)) : pool.filter((_, i) => i % 4 === 0);
  const followed_creators = byFollow.slice(0, 5).map((p, i) => personalizeRow(p, "Takip ettiğin üretici akışı", `${76 - i * 3}%`, i));

  const byPort = port.length
    ? pool.filter((p) => port.includes((p.asset_tag ?? "").toUpperCase()))
    : pool.filter((p) => Boolean(p.asset_tag)).slice(0, 8);
  const portfolio = byPort.slice(0, 4).map((p, i) => personalizeRow(p, "Portföy sembolü ile uyum", `${70 - i * 5}%`, i));

  const for_you = [...pool]
    .map((p, i) => ({ p, i, s: postAffinityScore(p, affinity) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map(({ p, i, s }) =>
      personalizeRow(p, "Davranış belleği + tartışma grafiği", `${Math.min(94, 52 + Math.round(Math.min(42, s * 0.28)))}%`, i),
    );

  const room_suggestions = [
    { id: "r1", label: "Fed sonrası seans", href: "/discover", sub: "Premium oda · yüksek katılım" },
    { id: "r2", label: "VIOP strateji köprüsü", href: "/discover?tab=trending", sub: "Aktif üretici moderasyonu" },
    { id: "r3", label: "Kripto derinlik", href: "/discover?tab=signals", sub: "Sinyal tartışması ile bağlı" },
  ];

  const topicDefaults = [
    { id: "t1", label: "Enflasyon & politika faizi", href: "/results?q=makro%20fed" },
    { id: "t2", label: "BIST açılış akışı", href: "/results?q=XU100%20açılış" },
    { id: "t3", label: "Altın volatilitesi", href: "/results?q=XAUUSD" },
  ];
  const topicFromGraph =
    affinity && affinity.meta.eventCount >= 4
      ? Object.entries(affinity.topics)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tok], idx) => ({
            id: `tg-${tok}-${idx}`,
            label: `#${tok}`,
            href: `/results?q=${encodeURIComponent(tok)}`,
          }))
      : [];
  const topic_suggestions = [...topicFromGraph, ...topicDefaults].slice(0, 5);

  return { for_you, watchlist, followed_creators, portfolio, room_suggestions, topic_suggestions };
}

export function buildDiscussionThreadNetwork(anchorPostId: string): DiscussionThreadNetwork | null {
  const pool = getMockDiscussionPostPool();
  const anchor = pool.find((p) => p.id === anchorPostId);
  if (!anchor) return null;
  const sameAsset = anchor.asset_tag
    ? pool.filter((p) => p.id !== anchor.id && (p.asset_tag ?? "").toUpperCase() === String(anchor.asset_tag).toUpperCase()).slice(0, 3)
    : pool.filter((p) => p.id !== anchor.id).slice(0, 3);

  const chain: DiscussionThreadNetworkNode[] = [
    {
      post_id: anchor.id,
      title: (anchor.title?.trim() || anchor.content.slice(0, 40)) + "…",
      href: `/post/${anchor.id}`,
      edge: "reply",
    },
    ...sameAsset.map(
      (p, i): DiscussionThreadNetworkNode => ({
        post_id: p.id,
        title: (p.title?.trim() || p.content.slice(0, 40)) + (p.content.length > 40 ? "…" : ""),
        href: `/post/${p.id}`,
        edge: (["quote", "topic", "signal"] as const)[i % 3],
      }),
    ),
  ];

  const related = pool
    .filter((p) => p.id !== anchor.id && p.user_id === anchor.user_id)
    .slice(0, 3)
    .map(
      (p): DiscussionThreadNetworkNode => ({
        post_id: p.id,
        title: (p.title?.trim() || p.content.slice(0, 36)) + "…",
        href: `/post/${p.id}`,
        edge: "creator",
      }),
    );

  return {
    anchor_post_id: anchor.id,
    chain,
    related_discussions: related,
    cross_topic: [
      { label: "Emsal tartışmalar", href: `/results?q=${encodeURIComponent(String(anchor.asset_tag ?? "piyasa"))}` },
      { label: "Sinyal eşlemesi", href: `/signals` },
    ],
  };
}

export function buildCreatorDiscussionGravity(limit = 8): CreatorDiscussionGravityRow[] {
  const pool = getMockDiscussionPostPool();
  const byCreator = new Map<string, { posts: number; heat: number }>();
  for (const p of pool) {
    const cur = byCreator.get(p.user_id) ?? { posts: 0, heat: 0 };
    cur.posts += 1;
    cur.heat += p.comments * 3 + p.likes;
    byCreator.set(p.user_id, cur);
  }
  const rows = [...byCreator.entries()]
    .map(([creator_id, v]) => {
      const prof = MOCK_PROFILE_BY_ID[creator_id];
      const name = prof?.full_name ?? prof?.username ?? "Üretici";
      const handle = prof ? `@${prof.username}` : "@user";
      const premium = prof?.tier === "elite" || prof?.tier === "pro";
      return {
        creator_id,
        name,
        handle,
        href: `/channel/${creator_id}`,
        momentum_score: Math.min(100, Math.round(v.heat / 8)),
        active_threads: v.posts,
        premium_badge: premium,
        heat_label: `${v.heat} tartışma ısısı`,
      };
    })
    .sort((a, b) => b.momentum_score - a.momentum_score);
  return rows.slice(0, limit);
}

export function buildDiscussionSearchRecommendationChips(query: string | null): DiscussionRecommendationChip[] {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) {
    return [
      { id: "c1", label: "Aktif VIOP", href: "/results?q=VIOP%20tartışma" },
      { id: "c2", label: "Fed & tahvil", href: "/results?q=Fed%20faiz" },
      { id: "c3", label: "BTC derinlik", href: "/results?q=BTC%20orderbook" },
      { id: "c4", label: "BIST açılış", href: "/results?q=XU100" },
      { id: "c5", label: "Üretici odaları", href: "/discover" },
    ];
  }
  return [
    { id: "r1", label: `${q} · yanıt yoğunu`, href: `/results?q=${encodeURIComponent(`${q} tartışma`)}` },
    { id: "r2", label: `${q} · sinyal bağlantısı`, href: `/results?q=${encodeURIComponent(`${q} sinyal`)}` },
    { id: "r3", label: `${q} · konu topluluğu`, href: `/results?q=${encodeURIComponent(`${q} topluluk`)}` },
  ];
}
