import type { AdaptiveLearningRecord } from "./adaptive-learning-types";
import { applyAdaptiveLearningPatch, touchAdaptiveSession } from "./adaptive-learning-store";
import type { AdaptiveLearningStateV1 } from "./adaptive-learning-store";

const MAX_IGNORE = 28;

function capList(arr: string[], max: number): string[] {
  return arr.filter(Boolean).slice(-max);
}

function addUnique(arr: string[], v: string): string[] {
  const x = v.trim();
  if (!x) return arr;
  return [...new Set([...arr, x])];
}

function applyRec(s: AdaptiveLearningStateV1, rec: AdaptiveLearningRecord): AdaptiveLearningStateV1 {
  switch (rec.type) {
    case "feed_impression": {
      let next: AdaptiveLearningStateV1 = {
        ...s,
        sessionCreatorHits: { ...s.sessionCreatorHits, [rec.creatorId]: (s.sessionCreatorHits[rec.creatorId] ?? 0) + 1 },
        sessionFormatHits: { ...s.sessionFormatHits, [rec.format]: (s.sessionFormatHits[rec.format] ?? 0) + 1 },
      };
      if (rec.assetUpper) {
        next = {
          ...next,
          sessionAssetHits: {
            ...next.sessionAssetHits,
            [rec.assetUpper]: (next.sessionAssetHits[rec.assetUpper] ?? 0) + 1,
          },
        };
      }
      for (const tok of rec.topicTokens) {
        const t = tok.toLowerCase();
        if (!t) continue;
        next = {
          ...next,
          sessionTopicHits: { ...next.sessionTopicHits, [t]: (next.sessionTopicHits[t] ?? 0) + 0.5 },
        };
      }
      return next;
    }
    case "watch_anchor": {
      let next: AdaptiveLearningStateV1 = {
        ...s,
        sessionCreatorHits: { ...s.sessionCreatorHits, [rec.creatorId]: (s.sessionCreatorHits[rec.creatorId] ?? 0) + 2 },
        sessionFormatHits: { ...s.sessionFormatHits, [rec.format]: (s.sessionFormatHits[rec.format] ?? 0) + 1 },
      };
      if (rec.assetUpper) {
        next = {
          ...next,
          sessionAssetHits: {
            ...next.sessionAssetHits,
            [rec.assetUpper]: (next.sessionAssetHits[rec.assetUpper] ?? 0) + 1,
          },
        };
      }
      return next;
    }
    case "discover_tab_view":
      return {
        ...s,
        explorationPulse: Math.min(9, s.explorationPulse + 0.35),
      };
    case "negative_creator":
      return {
        ...s,
        repeatSkips: s.repeatSkips + 1,
        creatorSkipWeight: { ...s.creatorSkipWeight, [rec.creatorId]: (s.creatorSkipWeight[rec.creatorId] ?? 0) + 1 },
        ignoredCreatorIds: capList(addUnique(s.ignoredCreatorIds, rec.creatorId), MAX_IGNORE),
      };
    case "negative_theme":
      return {
        ...s,
        repeatSkips: s.repeatSkips + 1,
        themeSkipWeight: { ...s.themeSkipWeight, [rec.token]: (s.themeSkipWeight[rec.token] ?? 0) + 1 },
        ignoredThemeTokens: capList(addUnique(s.ignoredThemeTokens, rec.token.toLowerCase()), MAX_IGNORE),
      };
    case "negative_format":
      return {
        ...s,
        repeatSkips: s.repeatSkips + 1,
        formatSkipWeight: { ...s.formatSkipWeight, [rec.format]: (s.formatSkipWeight[rec.format] ?? 0) + 1 },
        ignoredFormats: capList(addUnique(s.ignoredFormats, rec.format.toLowerCase()), MAX_IGNORE),
      };
    case "positive_creator":
      return {
        ...s,
        repeatEngagements: s.repeatEngagements + 1,
        creatorEngageWeight: { ...s.creatorEngageWeight, [rec.creatorId]: (s.creatorEngageWeight[rec.creatorId] ?? 0) + 1 },
        creatorSkipWeight: {
          ...s.creatorSkipWeight,
          [rec.creatorId]: Math.max(0, (s.creatorSkipWeight[rec.creatorId] ?? 0) * 0.65),
        },
      };
    case "recommendation_rail_view":
      return {
        ...s,
        explorationPulse: Math.min(9, s.explorationPulse + 0.5),
      };
    case "soft_post_skip":
      return {
        ...s,
        repeatSkips: s.repeatSkips + 0.35,
        creatorSkipWeight: {
          ...s.creatorSkipWeight,
          [rec.creatorId]: (s.creatorSkipWeight[rec.creatorId] ?? 0) + 0.42,
        },
      };
    default:
      return s;
  }
}

export function recordAdaptiveLearning(rec: AdaptiveLearningRecord): void {
  touchAdaptiveSession();
  applyAdaptiveLearningPatch((prev) => applyRec(prev, rec));
}

export function recordAdaptiveFromRecommendationLessCreator(creatorId: string): void {
  recordAdaptiveLearning({ type: "negative_creator", creatorId });
}

export function recordAdaptiveFromRecommendationHideCreator(creatorId: string): void {
  recordAdaptiveLearning({ type: "negative_creator", creatorId });
}
