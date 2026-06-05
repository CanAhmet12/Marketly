import type { DiscoverTopicCommunitySurface, TopicCommunitySummary } from "@/features/social/repository/community-types";
import type { PersonalizedDiscussionPack } from "@/features/social/repository/discussion-discovery-types";
import type { RecommendedCreatorCard } from "@/features/home/types";
import type { PersonalizedSignalRelevance } from "@/features/signals/repository/types";

import type { AffinityContext, InterestIntelligenceSnapshot } from "./personalization-types";
import type { ExplorationFeedbackState } from "./exploration-feedback-store";
import type { FeedFeedbackState } from "./feed-feedback-store";
import type { RecommendationMemoryState } from "./recommendation-memory-store";
import type { WatchFeedbackState } from "./watch-feedback-store";

export type RecommendationChip = {
  href: string;
  label: string;
  sub: string;
  /** İlişki ipucu — çok kısa */
  rel?: string;
  /** Öneri geri bildirimi (localStorage) */
  feedbackCreatorId?: string;
  /** Tema / makro ilgisi — slug veya sembol küçük harf */
  feedbackThemeSlug?: string;
};

export type StrategyProfileHints = {
  macroVsMomentum: "macro" | "momentum" | "balanced";
  horizon: "intraday" | "swing" | "mixed";
  conviction: "conviction" | "frequency" | "balanced";
  label: string;
};

export type RecommendationNetworkBundle = {
  strategyHints: StrategyProfileHints;
  creator_follow: RecommendationChip[];
  rising_creators: RecommendationChip[];
  premium_analysts: RecommendationChip[];
  similar_creators: RecommendationChip[];
  related_topics: RecommendationChip[];
  rising_communities: RecommendationChip[];
  portfolio_themes: RecommendationChip[];
  recommended_signals: RecommendationChip[];
  signal_style_peers: RecommendationChip[];
  affinity_line: string;
  coldStart: boolean;
};

export type RecommendationNetworkContext = {
  viewerId: string | null;
  excludeCreatorId: string | null;
  affinity: AffinityContext | null;
  intel: InterestIntelligenceSnapshot;
  recMem: RecommendationMemoryState;
  feedFb: FeedFeedbackState;
  exploreFb: ExplorationFeedbackState;
  watchFb: WatchFeedbackState;
  followedCreatorIds: ReadonlySet<string>;
  creators: readonly RecommendedCreatorCard[];
  topicSurface: DiscoverTopicCommunitySurface;
  discPack: PersonalizedDiscussionPack;
  sigRelevance: PersonalizedSignalRelevance;
  portfolioSymbols: readonly string[];
  watchedSymbols: readonly string[];
};

function topicChip(t: TopicCommunitySummary, sub: string, rel?: string): RecommendationChip {
  return { href: t.href, label: t.label, sub, rel, feedbackThemeSlug: t.slug };
}

function creatorChip(c: RecommendedCreatorCard, sub: string, rel?: string): RecommendationChip {
  return {
    href: `/channel/${encodeURIComponent(c.id)}`,
    label: c.name,
    sub,
    rel,
    feedbackCreatorId: c.id,
  };
}

function allowCreator(id: string, ctx: RecommendationNetworkContext): boolean {
  if (ctx.excludeCreatorId && id === ctx.excludeCreatorId) return false;
  if (ctx.recMem.hideCreatorIds.includes(id)) return false;
  if (ctx.recMem.lessCreatorIds.includes(id)) return false;
  if (ctx.feedFb.muteCreators.includes(id)) return false;
  if (ctx.exploreFb.notInterestedCreators.includes(id)) return false;
  if (ctx.watchFb.hideCreators.includes(id)) return false;
  return true;
}

function scoreCreator(c: RecommendedCreatorCard, ctx: RecommendationNetworkContext): number {
  let s = Math.log1p(Math.max(1, c.follower_count));
  const t = (c.tier ?? "").toLowerCase();
  if (t === "elite") s += 2.2;
  else if (t === "pro") s += 1.4;
  if (ctx.affinity) {
    s += (ctx.affinity.creators[c.id] ?? 0) * 0.028;
    const bio = `${c.expertise} ${c.bio ?? ""}`.toLowerCase();
    for (const th of ctx.recMem.interestedMarketThemes) {
      if (th && bio.includes(th)) s += 0.9;
    }
  }
  if (ctx.recMem.followInterestCreatorIds.includes(c.id)) s += 3;
  return s;
}

export function computeStrategyProfileHints(affinity: AffinityContext | null): StrategyProfileHints {
  if (!affinity || affinity.meta.eventCount < 4) {
    return {
      macroVsMomentum: "balanced",
      horizon: "mixed",
      conviction: "balanced",
      label: "Profil oluşuyor",
    };
  }
  const h = affinity.meta.horizonBias;
  const macroVsMomentum = h > 0.22 ? "macro" : h < -0.22 ? "momentum" : "balanced";
  const pulse = affinity.formats.pulse ?? 0;
  const video = affinity.formats.video ?? 0;
  const horizon = pulse > video * 1.15 ? "intraday" : video > pulse * 1.1 ? "swing" : "mixed";
  const div = affinity.meta.diversity;
  const conviction = div < 0.42 ? "conviction" : div > 0.62 ? "frequency" : "balanced";
  const label =
    macroVsMomentum === "macro"
      ? "Makro / tema ağırlığı"
      : macroVsMomentum === "momentum"
        ? "Kısa vade / momentum"
        : "Dengeli strateji";
  return { macroVsMomentum, horizon, conviction, label };
}

export function buildRecommendationNetworkBundle(ctx: RecommendationNetworkContext): RecommendationNetworkBundle {
  const strategyHints = computeStrategyProfileHints(ctx.affinity);
  const coldStart =
    !ctx.affinity ||
    ctx.affinity.meta.eventCount < 6 ||
    ctx.followedCreatorIds.size < 2;

  const pool = [...ctx.creators].filter((c) => allowCreator(c.id, ctx));
  const sorted = pool.sort((a, b) => scoreCreator(b, ctx) - scoreCreator(a, ctx));

  const followPool = sorted.filter((c) => !ctx.followedCreatorIds.has(c.id)).slice(0, 5);
  const followIds = new Set(followPool.map((c) => c.id));

  const creator_follow = followPool.map((c) => creatorChip(c, "Takip önerisi", "Ağ"));

  const premium_analysts = sorted
    .filter((c) => {
      const t = (c.tier ?? "").toLowerCase();
      return t === "elite" || t === "pro";
    })
    .slice(0, 4)
    .map((c) => creatorChip(c, "Premium analist", "Kalite"));

  const similar_creators = sorted
    .filter((c) => !followIds.has(c.id))
    .slice(0, 5)
    .map((c) => creatorChip(c, "Benzer üretici", "Örtüşme"));

  const rising_creators = ctx.intel.rising
    .filter((ch) => ch.kind === "creator")
    .slice(0, 4)
    .map((ch) => ({
      href: ch.href,
      label: ch.label,
      sub: "Yükselen",
      rel: "İlgi",
      feedbackCreatorId: ch.id,
    }));

  const ts = ctx.topicSurface;
  const related_topics = [
    ...ts.macroDebateTopics.slice(0, 2),
    ...ts.trending.slice(0, 2),
    ...ts.creatorHeavy.slice(0, 1),
  ].map((t) => topicChip(t, "Tema", "Topluluk"));

  const topicFallback = ctx.discPack.topic_suggestions.slice(0, 4).map((t) => ({
    href: t.href,
    label: t.label,
    sub: "Konu",
    rel: "Tartışma",
    feedbackThemeSlug: t.id,
  }));

  const mergedTopics = related_topics.length >= 3 ? related_topics : [...related_topics, ...topicFallback].slice(0, 6);

  const rising_communities = [...ts.rising.slice(0, 2), ...ts.fastestGrowing.slice(0, 2)].map((t) =>
    topicChip(t, "Topluluk", "Isı"),
  );

  const portfolio_themes = ctx.intel.marketThemes.slice(0, 4).map((m) => ({
    href: "/discover",
    label: m.label,
    sub: "Portföy teması",
    rel: m.scoreLabel,
    feedbackThemeSlug: m.id,
  }));

  const recommended_signals = ctx.sigRelevance.rows.slice(0, 5).map((r) => ({
    href: r.href,
    label: `${r.symbol} · ${r.analystDisplay}`,
    sub: "Sinyal",
    rel: r.reason,
    feedbackThemeSlug: r.symbol.replace(/^#/, "").toLowerCase(),
  }));

  const signal_style_peers = ctx.sigRelevance.rows.slice(1, 6).map((r) => ({
    href: `/results?q=${encodeURIComponent(r.symbol)}&tab=signals`,
    label: r.symbol,
    sub: "Benzer çağrı",
    rel: "Stil",
    feedbackThemeSlug: r.symbol.replace(/^#/, "").toLowerCase(),
  }));

  const affinity_line = coldStart
    ? ctx.intel.subline
    : `${strategyHints.label} · ${ctx.intel.confidenceLabel}`;

  return {
    strategyHints,
    creator_follow,
    rising_creators,
    premium_analysts,
    similar_creators,
    related_topics: mergedTopics,
    rising_communities,
    portfolio_themes,
    recommended_signals,
    signal_style_peers,
    affinity_line,
    coldStart,
  };
}
