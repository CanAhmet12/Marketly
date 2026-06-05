import type { FeedPost } from "@/features/feed/types";
import { isLivePost, isPulsePost, isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";

import { blendHomeEngagementScore } from "./personalization-engine";
import type { AffinityContext } from "./personalization-types";
import type { FeedFeedbackState } from "./feed-feedback-store";
import { isPostBlockedByFeedFeedback } from "./feed-feedback-store";
import type { AdaptiveFeedRankAdjust } from "./adaptive-learning-engine";

export type HomeFeedRankOptions = {
  affinity: AffinityContext | null;
  feedback: FeedFeedbackState;
  watchedSymbols: ReadonlySet<string>;
  portfolioSymbols: ReadonlySet<string>;
  followedCreatorIds: ReadonlySet<string>;
  /** Sembol etiketleri — piyasa nabzı ile hafif örtüşme */
  pulseSymbols: ReadonlySet<string>;
  coldStart: boolean;
  /** Oturum / yorgunluk / negatif sinyal — repository üretir */
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
  if (t === "elite") return 1.12;
  if (t === "pro") return 1.06;
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

function isFilteredOut(p: FeedPost, fb: FeedFeedbackState): boolean {
  return isPostBlockedByFeedFeedback(p, fb);
}

function baseEngagementScore(p: FeedPost, now: number): number {
  const ageHours = (now - new Date(p.created_at).getTime()) / 3_600_000;
  const gravity = 1.75;
  const q = Math.min(1.15, 0.72 + Math.log1p(p.comments) * 0.04 + Math.log1p(p.likes) * 0.02);
  return ((p.likes * 2 + p.comments * 3 + 1) / Math.pow(ageHours + 2, gravity)) * q;
}

function scorePost(p: FeedPost, opts: HomeFeedRankOptions, now: number): number {
  const { affinity, feedback, watchedSymbols, portfolioSymbols, followedCreatorIds, pulseSymbols, coldStart } = opts;
  let s = baseEngagementScore(p, now);
  s = blendHomeEngagementScore(p, s, affinity);

  const ast = postAssetUpper(p);
  if (ast && watchedSymbols.has(ast)) s *= 1.085;
  if (ast && portfolioSymbols.has(ast)) s *= 1.055;
  if (followedCreatorIds.has(p.user_id)) s *= 1.11;
  if (ast && pulseSymbols.has(ast)) s *= 1.035;

  s *= tierWeight(p.author_tier);

  if (affinity) {
    s += topicAffinitySum(p, affinity) * 0.085;
    s += (affinity.discussions[p.id] ?? 0) * 0.06;
  }

  for (const tok of contentTokens(p)) {
    if (feedback.interestedTopics.includes(tok)) s *= 1.05;
    if (feedback.notInterestedTopics.includes(tok)) s *= 0.82;
  }

  if (feedback.moreLikeCreatorIds.includes(p.user_id)) s *= 1.08;
  if (feedback.lessLikePostIds.includes(p.id)) s *= 0.35;

  if (coldStart) {
    s *= 1.02 + Math.min(0.06, (p.comments + p.likes) * 0.0004);
  }

  if (opts.adaptive) {
    s *= opts.adaptive.postMultiplier(p);
  }

  return s;
}

/** Üretici / varlık / format çeşitliliği — deterministik yeniden sıralama */
function diversityReorder(scored: { post: FeedPost; score: number }[]): FeedPost[] {
  const pool = [...scored].sort((a, b) => b.score - a.score);
  const out: FeedPost[] = [];
  const window = 7;

  while (pool.length) {
    let pickedIdx = -1;
    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i]!.post;
      const tail = out.slice(-window);
      const creators = tail.map((x) => x.user_id);
      const cN = creators.filter((id) => id === cand.user_id).length;
      if (cN >= 2) continue;

      const assets = tail.map((x) => postAssetUpper(x)).filter(Boolean) as string[];
      const a = postAssetUpper(cand);
      const aN = a ? assets.filter((x) => x === a).length : 0;
      if (a && aN >= 2) continue;

      const kinds = tail.map((x) => postFormatKey(x));
      const k = postFormatKey(cand);
      const kN = kinds.filter((t) => t === k).length;
      if (kN >= 3) continue;

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

export function computeHomeFeedRanking(posts: readonly FeedPost[], opts: HomeFeedRankOptions): FeedPost[] {
  const now = NOW();
  const fb = opts.feedback;
  const filtered = posts.filter((p) => !isFilteredOut(p, fb));
  if (!filtered.length) return [];

  const scored = filtered.map((post) => ({
    post,
    score: scorePost(post, opts, now),
  }));

  return diversityReorder(scored);
}

/** Kompakt açıklama — editorial alt satır */
export function explainPostRank(p: FeedPost, opts: HomeFeedRankOptions): string | null {
  const ast = postAssetUpper(p);
  if (ast && opts.watchedSymbols.has(ast)) return "İzleme listenden";
  if (ast && opts.portfolioSymbols.has(ast)) return "Portföyünle ilişkili";
  if (opts.followedCreatorIds.has(p.user_id)) return "Takip ettiklerinden";
  if (ast && opts.pulseSymbols.has(ast)) return "Gündemde";
  if (opts.affinity && topicAffinitySum(p, opts.affinity) >= 8) return "İlgine yakın";
  if (opts.affinity && (opts.affinity.creators[p.user_id] ?? 0) >= 18) return "Sana yakın bir üretici";
  if (opts.coldStart && (p.comments + p.likes) > 24) return "Toplulukta hareketli";
  return null;
}
