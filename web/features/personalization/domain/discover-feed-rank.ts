import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";
import type { FeedPost } from "@/features/feed/types";
import { isLivePost, isPulsePost, isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";

import type { ExplorationFeedbackState } from "./exploration-feedback-store";
import type { FeedFeedbackState } from "./feed-feedback-store";
import { isPostBlockedByFeedFeedback } from "./feed-feedback-store";
import { blendHomeEngagementScore } from "./personalization-engine";
import type { AffinityContext } from "./personalization-types";
import type { AdaptiveFeedRankAdjust } from "./adaptive-learning-engine";

export type DiscoverFeedRankOptions = {
  tab: DiscoverTabId;
  affinity: AffinityContext | null;
  feedFeedback: FeedFeedbackState;
  exploration: ExplorationFeedbackState;
  watchedSymbols: ReadonlySet<string>;
  portfolioSymbols: ReadonlySet<string>;
  followedCreatorIds: ReadonlySet<string>;
  pulseSymbols: ReadonlySet<string>;
  discussionBoostPostIds: ReadonlySet<string>;
  hotSignalSymbols: ReadonlySet<string>;
  coldStart: boolean;
  adaptive?: AdaptiveFeedRankAdjust | null;
};

const NOW = () => Date.now();

function postAssetUpper(p: FeedPost): string | null {
  const t = p.asset_tag?.trim();
  if (!t) return null;
  return t.replace(/^#/, "").toUpperCase();
}

function contentTokens(p: FeedPost): string[] {
  const raw = `${p.title ?? ""} ${p.content ?? ""}`.toLowerCase();
  const out = new Set<string>();
  const m = raw.match(/#[\p{L}\d_]+/gu);
  if (m) for (const x of m) out.add(x.replace(/^#/, "").slice(0, 24));
  const ast = postAssetUpper(p);
  if (ast) out.add(ast.toLowerCase());
  return [...out].slice(0, 16);
}

function postFormatKey(p: FeedPost): "signal" | "pulse" | "live" | "video" | "text" {
  if (isSignalPost(p)) return "signal";
  if (isPulsePost(p)) return "pulse";
  if (isLivePost(p)) return "live";
  if (isVideoLikePost(p)) return "video";
  return "text";
}

function tierWeight(tier: string | undefined): number {
  const t = (tier ?? "").toLowerCase();
  if (t === "elite") return 1.1;
  if (t === "pro") return 1.05;
  return 1;
}

function topicAffinitySum(p: FeedPost, ctx: AffinityContext | null): number {
  if (!ctx) return 0;
  let s = 0;
  for (const tok of contentTokens(p)) {
    s += ctx.topics[tok] ?? 0;
  }
  return s;
}

function explorationGamma(tab: DiscoverTabId): number {
  switch (tab) {
    case "trending":
      return 0.52;
    case "pulse":
      return 0.62;
    case "videos":
      return 0.48;
    case "live":
      return 0.58;
    default:
      return 0.45;
  }
}

function noveltyBoost(p: FeedPost, affinity: AffinityContext | null, gamma: number): number {
  if (!affinity) return 1 + gamma * 0.08;
  const c = affinity.creators[p.user_id] ?? 0;
  const unfamiliar = 1 - Math.min(1, c / 72);
  return 1 + gamma * 0.14 * unfamiliar;
}

function isExplorationFiltered(p: FeedPost, exp: ExplorationFeedbackState): boolean {
  if (exp.notInterestedCreators.includes(p.user_id)) return true;
  for (const tok of contentTokens(p)) {
    if (exp.hideTopics.includes(tok)) return true;
  }
  return false;
}

function baseEngagementDiscover(p: FeedPost, now: number): number {
  const ageHours = (now - new Date(p.created_at).getTime()) / 3_600_000;
  const gravity = 1.55;
  const q = Math.min(1.12, 0.68 + Math.log1p(p.comments) * 0.035 + Math.log1p(p.likes) * 0.018);
  return ((p.likes * 1.85 + p.comments * 2.6 + 1) / Math.pow(ageHours + 1.6, gravity)) * q;
}

function tabFormatBias(tab: DiscoverTabId, p: FeedPost): number {
  const k = postFormatKey(p);
  if (tab === "pulse" && k === "pulse") return 1.12;
  if (tab === "videos" && k === "video") return 1.14;
  if (tab === "live" && k === "live") return 1.16;
  if (tab === "trending") {
    if (k === "signal") return 1.04;
    if (k === "live") return 1.03;
    return 1;
  }
  return 1;
}

function scoreDiscoverPost(p: FeedPost, opts: DiscoverFeedRankOptions, now: number): number {
  const { affinity, feedFeedback, exploration, watchedSymbols, portfolioSymbols, followedCreatorIds, pulseSymbols } = opts;
  let s = baseEngagementDiscover(p, now);
  s = blendHomeEngagementScore(p, s, affinity);

  const ast = postAssetUpper(p);
  if (ast && watchedSymbols.has(ast)) s *= 1.07;
  if (ast && portfolioSymbols.has(ast)) s *= 1.05;
  if (followedCreatorIds.has(p.user_id)) s *= 1.04;
  if (ast && pulseSymbols.has(ast)) s *= 1.045;
  if (ast && opts.hotSignalSymbols.has(ast)) s *= 1.055;

  s *= tierWeight(p.author_tier);
  s *= tabFormatBias(opts.tab, p);

  if (opts.discussionBoostPostIds.has(p.id)) s *= 1.06;

  if (affinity) {
    s += topicAffinitySum(p, affinity) * 0.078;
    s += (affinity.discussions[p.id] ?? 0) * 0.055;
    s += (affinity.creators[p.user_id] ?? 0) * 0.009;
    s += (affinity.formats[postFormatKey(p)] ?? 0) * 0.012;
  }

  for (const tok of contentTokens(p)) {
    if (feedFeedback.interestedTopics.includes(tok)) s *= 1.035;
    if (feedFeedback.notInterestedTopics.includes(tok)) s *= 0.88;
    if (exploration.interestedThemes.includes(tok)) s *= 1.04;
  }

  if (exploration.interestedCreators.includes(p.user_id)) s *= 1.07;
  if (exploration.moreFingerprints.includes(`post:${p.id}`)) s *= 1.09;
  if (exploration.moreFingerprints.includes(`creator:${p.user_id}`)) s *= 1.06;
  if (exploration.lessFingerprints.includes(`post:${p.id}`)) s *= 0.42;

  const tabFp = `discover_tab:${opts.tab}`;
  if (exploration.lessFingerprints.includes(tabFp)) s *= 0.9;
  if (exploration.moreFingerprints.includes(tabFp)) s *= 1.05;
  if (exploration.moreFingerprints.includes("discover_explore_rail")) s *= 1.028;
  if (exploration.lessFingerprints.includes("discover_explore_rail")) s *= 0.94;

  const g0 = explorationGamma(opts.tab);
  const g = g0 + (opts.adaptive?.discoverNoveltyGammaAdd ?? 0);
  s *= noveltyBoost(p, affinity, g);

  if (opts.coldStart) {
    s *= 1.03 + Math.min(0.05, (p.comments + p.likes) * 0.00035);
  }

  if (opts.adaptive) {
    s *= opts.adaptive.postMultiplier(p);
  }

  return s;
}

function diversityWindow(tab: DiscoverTabId): number {
  if (tab === "live") return 4;
  if (tab === "pulse") return 5;
  if (tab === "videos") return 6;
  return 7;
}

function diversityReorderDiscover(tab: DiscoverTabId, scored: { post: FeedPost; score: number }[]): FeedPost[] {
  const pool = [...scored].sort((a, b) => b.score - a.score);
  const out: FeedPost[] = [];
  const window = diversityWindow(tab);

  while (pool.length) {
    let pickedIdx = -1;
    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i]!.post;
      const tail = out.slice(-window);
      const creators = tail.map((x) => x.user_id);
      if (creators.filter((id) => id === cand.user_id).length >= 2) continue;

      const assets = tail.map((x) => postAssetUpper(x)).filter(Boolean) as string[];
      const a = postAssetUpper(cand);
      if (a && assets.filter((x) => x === a).length >= 2) continue;

      const kinds = tail.map((x) => postFormatKey(x));
      const k = postFormatKey(cand);
      if (kinds.filter((t) => t === k).length >= 3) continue;

      pickedIdx = i;
      break;
    }
    if (pickedIdx === -1) {
      out.push(pool.shift()!.post);
    } else {
      const [row] = pool.splice(pickedIdx, 1);
      out.push(row!.post);
    }
  }
  return out;
}

export function computeDiscoverFeedRanking(posts: readonly FeedPost[], opts: DiscoverFeedRankOptions): FeedPost[] {
  if (opts.tab === "signals" || opts.tab === "creators") return [];

  const now = NOW();
  let filtered = posts.filter(
    (p) => !isPostBlockedByFeedFeedback(p, opts.feedFeedback) && !isExplorationFiltered(p, opts.exploration),
  );
  // Keşfet boş kalmasın: keşif filtresi her şeyi süpürdüyse yalnızca sessiz/gizle kuralları uygula
  if (!filtered.length && posts.length) {
    filtered = posts.filter((p) => !isPostBlockedByFeedFeedback(p, opts.feedFeedback));
  }
  if (!filtered.length) return [];

  const scored = filtered.map((post) => ({
    post,
    score: scoreDiscoverPost(post, opts, now),
  }));

  return diversityReorderDiscover(opts.tab, scored);
}

export function explainDiscoverRank(p: FeedPost, opts: DiscoverFeedRankOptions): string | null {
  const ast = postAssetUpper(p);
  if (ast && opts.watchedSymbols.has(ast)) return "İzleme listesi";
  if (ast && opts.portfolioSymbols.has(ast)) return "Portföy";
  if (opts.discussionBoostPostIds.has(p.id)) return "Tartışma ivmesi";
  if (ast && opts.hotSignalSymbols.has(ast)) return "Sinyal bağlamı";
  if (opts.affinity && topicAffinitySum(p, opts.affinity) >= 8) return "Konu ısısı";
  const g = explorationGamma(opts.tab) + (opts.adaptive?.discoverNoveltyGammaAdd ?? 0);
  if (noveltyBoost(p, opts.affinity, g) > 1.09) return "Yeni keşif";
  if (opts.coldStart && (p.comments + p.likes) > 20) return "Aktif topluluk";
  return null;
}
