import { getMarketsRepository } from "@/features/markets/repository";
import { getSignalsRepository } from "@/features/signals/repository";
import type {
  AssetCommunityHubBundle,
  CommunityContributorRow,
  CommunitySearchHit,
  DiscoverMarketTopicBridge,
  DiscoverTopicCommunitySurface,
  HomeTopicCommunityStrip,
  TopicCommunitySummary,
  TopicSentimentBand,
} from "@/features/social/repository/community-types";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";
import { MOCK_PROFILES } from "@/mock/fixtures/profiles";

type TopicSeed = {
  slug: string;
  label: string;
  blurb: string;
  keywords: string[];
  symbols: string[];
  macro: boolean;
};

const TOPICS: TopicSeed[] = [
  { slug: "ai", label: "Yapay Zeka", blurb: "Çip, veri merkezi ve model ekonomisi", keywords: ["ai", "nvda", "semis", "model"], symbols: ["NVDA", "AMD", "MSFT"], macro: false },
  { slug: "macro", label: "Makro", blurb: "Büyüme, politika faizi ve likidite", keywords: ["macro", "fed", "faiz", "likidite"], symbols: ["TLT", "DXY"], macro: true },
  { slug: "nasdaq", label: "Nasdaq", blurb: "Büyüme teknolojisi ve volatilite", keywords: ["nasdaq", "qqq", "growth"], symbols: ["QQQ", "AAPL", "META"], macro: false },
  { slug: "bitcoin", label: "Bitcoin", blurb: "Dijital altın ve kurumsal akış", keywords: ["bitcoin", "btc", "onchain"], symbols: ["BTC"], macro: false },
  { slug: "altcoins", label: "Altcoin", blurb: "Likidite rotasyonu ve beta", keywords: ["alt", "eth", "defi"], symbols: ["ETH", "SOL"], macro: false },
  { slug: "energy", label: "Enerji", blurb: "Arz-talep ve jeopolitika", keywords: ["petrol", "energy", "lng"], symbols: ["XOM", "CVX"], macro: true },
  { slug: "inflation", label: "Enflasyon", blurb: "Fiyat zinciri ve reel getiri", keywords: ["enflasyon", "cpi", "inflation"], symbols: ["GLD"], macro: true },
  { slug: "bist", label: "BIST", blurb: "Yerel akış ve kur etkisi", keywords: ["bist", "xu100", "thy"], symbols: ["XU100", "THYAO"], macro: false },
  { slug: "earnings", label: "Kazanç", blurb: "Rehberlik ve sürpriz", keywords: ["earnings", "kazanç", "eps"], symbols: ["TSLA", "AMZN"], macro: false },
  { slug: "fed", label: "Fed", blurb: "Para politikası ve beklentiler", keywords: ["fed", "powell", "dot"], symbols: ["TLT"], macro: true },
  { slug: "gold", label: "Altın", blurb: "Reel faiz ve risk iştahı", keywords: ["altın", "gold", "xau"], symbols: ["XAUUSD", "GLD"], macro: true },
  { slug: "fx", label: "FX", blurb: "Carry ve makro spread", keywords: ["fx", "kur", "usdtry"], symbols: ["USDTRY", "EURUSD"], macro: true },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function topicHref(slug: string, label: string): string {
  void slug;
  return `/results?q=${encodeURIComponent(label)}&tab=communities`;
}

function sentimentForSlug(slug: string): { band: TopicSentimentBand; label: string } {
  const h = hash(slug) % 10;
  if (h >= 6) return { band: "bullish", label: "Isı artıyor" };
  if (h >= 3) return { band: "mixed", label: "Dengeli tartışma" };
  return { band: "bearish", label: "Koruma ağırlıklı" };
}

function scorePostForTopic(p: (typeof MOCK_POST_SOURCES)[0], t: TopicSeed): number {
  const blob = `${p.content ?? ""} ${p.title ?? ""} ${p.asset_tag ?? ""}`.toLowerCase();
  let s = 0;
  for (const k of t.keywords) {
    if (blob.includes(k)) s += 3;
  }
  const tag = (p.asset_tag ?? "").toUpperCase();
  for (const sym of t.symbols) {
    if (tag === sym) s += 6;
  }
  return s;
}

function buildTopicSummary(t: TopicSeed, rankBoost: number): TopicCommunitySummary {
  let threads = 0;
  const creators = new Set<string>();
  for (const p of MOCK_POST_SOURCES) {
    const sc = scorePostForTopic(p, t);
    if (sc > 0) {
      threads += 1;
      creators.add(p.user_id);
    }
  }
  const base = 12 + (hash(t.slug) % 40) + rankBoost * 5;
  threads = Math.max(threads, Math.floor(base / 8));
  const heatScore = base + threads * 4 + creators.size * 6;
  const sent = sentimentForSlug(t.slug);
  const macroChainLabel = t.macro ? "Makro zinciri" : null;
  return {
    slug: t.slug,
    label: t.label,
    blurb: t.blurb,
    heatScore,
    heatLabel: `${heatScore} ısı`,
    threadCount: threads + (hash(t.slug) % 5),
    creatorCount: Math.max(creators.size, 3 + (hash(t.label) % 8)),
    analystPresenceLabel: `${3 + (hash(t.slug) % 5)} analist aktif`,
    sentimentBand: sent.band,
    sentimentLabel: sent.label,
    macroChainLabel,
    href: topicHref(t.slug, t.label),
    linkedSymbols: t.symbols.slice(0, 4),
  };
}

export function buildDiscoverTopicCommunitySurface(): DiscoverTopicCommunitySurface {
  const ranked = TOPICS.map((t, i) => ({ t, summary: buildTopicSummary(t, TOPICS.length - i) })).sort((a, b) => b.summary.heatScore - a.summary.heatScore);
  const trending = ranked.slice(0, 6).map((x) => x.summary);
  const rising = [...ranked].sort((a, b) => b.summary.threadCount - a.summary.threadCount).slice(0, 5).map((x) => x.summary);
  const creatorHeavy = [...ranked].sort((a, b) => b.summary.creatorCount - a.summary.creatorCount).slice(0, 4).map((x) => x.summary);
  const fastestGrowing = [...ranked].sort((a, b) => a.summary.heatScore - b.summary.heatScore).slice(0, 4).map((x) => x.summary);
  const macroDebateTopics = TOPICS.filter((x) => x.macro).map((t, i) => buildTopicSummary(t, i + 2));

  return {
    intelligenceHeadline: "Tartışma yoğunluğu yükselen temalar — sinyal ve gönderi akışlarıyla bağlı.",
    trending,
    rising,
    creatorHeavy,
    fastestGrowing,
    premiumHints: [
      { id: "ph1", text: "Kurumsal akışa açık odalar", href: "/discover?tab=trending" },
      { id: "ph2", text: "Üretici pin’li makro zinciri", href: "/discover?tab=pulse" },
      { id: "ph3", text: "Yüksek tez ayrışması", href: "/signals" },
    ],
    macroDebateTopics,
  };
}

export function buildHomeTopicCommunityStrip(): HomeTopicCommunityStrip {
  const s = buildDiscoverTopicCommunitySurface();
  return {
    trending_chips: s.trending.slice(0, 8),
    rising_chips: s.rising.slice(0, 8),
    creator_lane: s.creatorHeavy.slice(0, 6),
  };
}

export function buildDiscoverMarketTopicBridge(): DiscoverMarketTopicBridge {
  const net = getMarketsRepository().getMarketCommunityNetwork();
  const chains = net.crossAssetChains.slice(0, 4).map((c) => ({
    id: c.id,
    leftSymbol: c.leftSymbol,
    rightSymbol: c.rightSymbol,
    intensityLabel: c.intensityLabel,
    theme: c.theme,
    href: c.href,
  }));
  const s = buildDiscoverTopicCommunitySurface();
  return { crossAssetChains: chains, topicChips: s.trending.slice(0, 7) };
}

export function buildAssetCommunityHub(symbol: string): AssetCommunityHubBundle | null {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;
  const bundle = getMarketsRepository().getAssetIntelligenceBundle(symbol.trim());
  if (!bundle) return null;

  const relatedThemes = TOPICS.filter((t) => t.symbols.some((x) => x.toUpperCase() === sym)).map((t, i) => buildTopicSummary(t, i));

  const rows = getSignalsRepository().getFeedRows().filter((r) => r.symbol.toUpperCase() === sym);
  const active_signals = rows.slice(0, 3).map((r) => ({
    signal_id: r.id,
    href: `/signals?asset=${encodeURIComponent(sym)}`,
    direction: r.direction,
    confidence: r.confidence,
    label: `${r.direction} · %${r.confidence}`,
  }));

  const h = hash(sym);
  const band: TopicSentimentBand = h % 3 === 0 ? "bullish" : h % 3 === 1 ? "bearish" : "mixed";
  const sentiment_label = band === "bullish" ? "Topluluk risk iştahı yüksek" : band === "bearish" ? "Koruyucu tez ağırlıklı" : "Tezler ayrışıyor";

  const profiles = MOCK_PROFILES.slice(0, 12);
  const top_contributors: CommunityContributorRow[] = profiles.slice(0, 5).map((p, i) => ({
    user_id: p.id,
    name: p.full_name ?? p.username,
    handle: `@${p.username}`,
    avatar_url: p.avatar_url ?? null,
    contributor_score: 60 - i * 7 + (h % 9),
    is_creator: i < 2,
  }));

  const rooms = [
    { id: "r1", label: "Tez masası", heat_label: "yüksek", href: `/discover?tab=trending` },
    { id: "r2", label: "Akış özeti", heat_label: "orta", href: `/results?q=${encodeURIComponent(sym)}&tab=discussions` },
    { id: "r3", label: "Sinyal zinciri", heat_label: "sıcak", href: `/signals?asset=${encodeURIComponent(sym)}` },
  ];

  const network_edges = [
    { id: "e1", text: `Örtüşen temalar: ${relatedThemes.slice(0, 2).map((x) => x.label).join(" · ") || "Makro · Sektör"}`, href: "/discover" },
    { id: "e2", text: "Korelasyon tartışması (mock)", href: `/markets/${encodeURIComponent(sym)}` },
  ];

  return {
    symbol: sym,
    momentum_label: h % 2 === 0 ? "Tartışma ivmesi ↑" : "Tartışma ivmesi sabit",
    sentiment_label,
    sentiment_band: band,
    thesis_split_label: `%${42 + (h % 20)} tez long · %${58 - (h % 20)} nötr / short`,
    participation_density_label: `${8 + (h % 6)} aktif katılımcı / 100 gönderi`,
    discussion_intensity_label: `${3 + (h % 4)}.2 yanıt derinliği (mock)`,
    creator_concentration_label: `%${35 + (h % 25)} üretici yoğunluğu`,
    active_rooms: rooms,
    top_contributors,
    active_signals,
    related_themes: relatedThemes.length ? relatedThemes : buildDiscoverTopicCommunitySurface().trending.slice(0, 4),
    overlapping_creators_note: "Üst katmanda görünen analistler bu varlıkta da tekrarlıyor (mock çakışma).",
    network_edges,
  };
}

export function searchMockTopicCommunityHits(query: string, limit = 24): CommunitySearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOPICS.slice(0, limit).map(topicSearchHit);

  const scored = TOPICS.map((t) => {
    const hay = [t.label, t.blurb, t.slug, ...t.keywords, ...t.symbols].join(" ").toLowerCase();
    let score = 0;
    for (const term of q.split(/\s+/).filter(Boolean)) {
      if (hay === term) score += 12;
      else if (hay.includes(term)) score += 5;
    }
    return { t, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const out = scored.map((x) => topicSearchHit(x.t));
  return out.length ? out : TOPICS.slice(0, Math.min(limit, 6)).map(topicSearchHit);
}

function topicSearchHit(t: TopicSeed): CommunitySearchHit {
  const s = buildTopicSummary(t, 0);
  return {
    id: `comm:${t.slug}`,
    slug: t.slug,
    title: t.label,
    subtitle: t.blurb,
    heat_label: s.heatLabel,
    href: topicHref(t.slug, t.label),
    sentiment_label: s.sentimentLabel,
    linked_symbols: t.symbols,
  };
}

export function buildCreatorTopicCommunities(channelUserId: string): TopicCommunitySummary[] {
  const posts = MOCK_POST_SOURCES.filter((p) => p.user_id === channelUserId);
  if (!posts.length) return buildDiscoverTopicCommunitySurface().trending.slice(0, 4);

  const scores = new Map<string, number>();
  for (const t of TOPICS) {
    let sc = 0;
    for (const p of posts) sc += scorePostForTopic(p, t);
    if (sc > 0) scores.set(t.slug, sc);
  }
  const ordered = TOPICS.filter((t) => (scores.get(t.slug) ?? 0) > 0)
    .sort((a, b) => (scores.get(b.slug) ?? 0) - (scores.get(a.slug) ?? 0))
    .slice(0, 6);

  if (!ordered.length) return buildDiscoverTopicCommunitySurface().creatorHeavy.slice(0, 4);
  return ordered.map((t, i) => buildTopicSummary(t, i));
}
