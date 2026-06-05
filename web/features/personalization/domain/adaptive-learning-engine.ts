import type { FeedPost } from "@/features/feed/types";
import { isLivePost, isPulsePost, isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";
import type { WatchNextCandidate } from "./personalization-types";
import type { RecommendationMemoryState } from "./recommendation-memory-store";
import type { AdaptiveLearningStateV1 } from "./adaptive-learning-store";
import type { AffinityContext } from "./personalization-types";
import type { RecommendationAdaptationSnapshot } from "./adaptive-learning-types";

export type AdaptiveFeedRankAdjust = {
  postMultiplier: (p: FeedPost) => number;
  discoverNoveltyGammaAdd: number;
};

function postFormatKey(p: FeedPost): "signal" | "pulse" | "live" | "video" | "text" {
  if (isSignalPost(p)) return "signal";
  if (isPulsePost(p)) return "pulse";
  if (isLivePost(p)) return "live";
  if (isVideoLikePost(p)) return "video";
  return "text";
}

function topicTokensFromPost(p: FeedPost): string[] {
  const raw = `${p.title ?? ""} ${p.content ?? ""}`.toLowerCase();
  const out = new Set<string>();
  const m = raw.match(/#[\p{L}\d_]+/gu);
  if (m) for (const x of m) out.add(x.replace(/^#/, "").slice(0, 24).toLowerCase());
  const ast = p.asset_tag?.replace(/^#/, "").trim().toUpperCase();
  if (ast) out.add(ast.toLowerCase());
  return [...out].slice(0, 14);
}

export function buildAdaptiveFeedRankAdjust(
  state: AdaptiveLearningStateV1,
  affinity: AffinityContext | null,
): AdaptiveFeedRankAdjust {
  const sessionImp = (id: string) => Math.min(5, state.sessionCreatorHits[id] ?? 0);
  const skipW = (id: string) => Math.min(4, state.creatorSkipWeight[id] ?? 0);
  const engageW = (id: string) => Math.min(3, state.creatorEngageWeight[id] ?? 0);
  const astImp = (a: string) => Math.min(4, state.sessionAssetHits[a] ?? 0);
  const fmtSkip = (fmt: string) => Math.min(3, state.formatSkipWeight[fmt.toLowerCase()] ?? 0);
  const topicSkip = (tok: string) => Math.min(3, state.themeSkipWeight[tok.toLowerCase()] ?? 0);
  const topicImp = (tok: string) => Math.min(3, state.sessionTopicHits[tok.toLowerCase()] ?? 0);

  const sumSession =
    Object.values(state.sessionCreatorHits).reduce((a, b) => a + b, 0) +
    Object.values(state.sessionAssetHits).reduce((a, b) => a + b, 0) * 0.45;
  const fatigueIdx = Math.min(1, sumSession / 32 + Math.min(0.35, state.repeatSkips * 0.012));

  const noveltyGammaAdd =
    Math.min(0.08, state.explorationPulse * 0.035) +
    Math.min(0.08, fatigueIdx * 0.12) +
    (affinity && affinity.meta.diversity < 0.44 ? 0.045 : 0);

  return {
    discoverNoveltyGammaAdd: Math.min(0.2, noveltyGammaAdd),
    postMultiplier: (p: FeedPost) => {
      const cid = p.user_id;
      let m = 1;
      m -= 0.042 * sessionImp(cid);
      m -= 0.038 * skipW(cid);
      m += 0.032 * engageW(cid);
      const ast = p.asset_tag?.replace(/^#/, "").trim().toUpperCase() || null;
      if (ast) {
        m -= 0.034 * astImp(ast);
        m -= 0.022 * topicSkip(ast.toLowerCase());
      }
      const fmt = postFormatKey(p);
      m -= 0.038 * fmtSkip(fmt);
      m -= 0.022 * Math.min(3, state.sessionFormatHits[fmt] ?? 0);
      for (const tok of topicTokensFromPost(p)) {
        m -= 0.018 * topicSkip(tok);
        m -= 0.014 * topicImp(tok);
      }
      if (state.ignoredCreatorIds.includes(cid)) m *= 0.58;
      if (state.ignoredFormats.includes(fmt)) m *= 0.9;
      return Math.max(0.54, Math.min(1.12, m));
    },
  };
}

export function buildAdaptiveWatchMultiplier(state: AdaptiveLearningStateV1): (c: WatchNextCandidate) => number {
  return (c) => {
    let m = 1;
    m -= 0.048 * Math.min(5, state.sessionCreatorHits[c.user_id] ?? 0);
    m -= 0.042 * Math.min(4, state.creatorSkipWeight[c.user_id] ?? 0);
    m += 0.038 * Math.min(3, state.creatorEngageWeight[c.user_id] ?? 0);
    const ast = c.asset_tag?.replace(/^#/, "").trim().toUpperCase();
    if (ast) m -= 0.032 * Math.min(4, state.sessionAssetHits[ast] ?? 0);
    return Math.max(0.52, Math.min(1.1, m));
  };
}

export function computeRecommendationAdaptationSnapshot(input: {
  affinity: AffinityContext;
  state: AdaptiveLearningStateV1;
  rec: RecommendationMemoryState;
}): RecommendationAdaptationSnapshot {
  const { affinity, state, rec } = input;
  const ev = affinity.meta.eventCount;
  const confBase = affinity.meta.confidence;
  const overallConfidence = Math.min(1, 0.16 + ev * 0.01 + confBase * 0.52 + Math.min(0.12, state.repeatEngagements * 0.008));

  const sumSession =
    Object.values(state.sessionCreatorHits).reduce((a, b) => a + b, 0) +
    Object.values(state.sessionAssetHits).reduce((a, b) => a + b, 0) * 0.4;
  const fatigueIndex = Math.min(1, sumSession / 30 + Math.min(0.38, state.repeatSkips * 0.014));

  const explorationShare = Math.min(
    1,
    0.22 + state.explorationPulse * 0.055 + (1 - overallConfidence) * 0.28 + fatigueIndex * 0.12,
  );

  const echo = state.affinityEcho;
  let driftLabel: string | null = null;
  if (echo && ev >= echo.eventCount + 2 && Math.abs(affinity.meta.horizonBias - echo.horizonBias) > 0.11) {
    driftLabel = "İlgin değişiyor olabilir";
  }
  if (echo && Math.abs(affinity.meta.diversity - echo.diversity) > 0.14 && ev >= echo.eventCount + 2) {
    driftLabel = driftLabel ?? "Yeni strateji eğilimi";
  }

  const hints: string[] = [];
  if (explorationShare > 0.52) hints.push("Daha fazla keşif gösteriliyor");
  if (fatigueIndex > 0.48) hints.push("Farklı creator’lar öneriliyor");
  if (rec.interestedMarketThemes.length >= 3) hints.push("Yeni ilgi alanı fark edildi");
  if (driftLabel) hints.unshift(driftLabel);

  const uniq = [...new Set(hints)].slice(0, 2);
  const coldData = ev < 5 && state.repeatEngagements < 2 && rec.interestedStrategies.length === 0;

  const subline = coldData
    ? "Davranış özeti oluşunca güven ve keşif dengesi netleşecek."
    : overallConfidence < 0.42
      ? "Veri seyrek — öneriler temkinli ve çeşitlilik ağırlıklı."
      : fatigueIndex > 0.55
        ? "Tekrar yorgunluğu azaltıldı; rotasyon ve taze öğeler öne alındı."
        : "Öneri motoru oturum ve geri bildirimlere göre yumuşak ayarlanıyor.";

  return {
    overallConfidence,
    explorationShare,
    fatigueIndex,
    driftLabel,
    hints: uniq,
    subline,
    coldData,
  };
}
