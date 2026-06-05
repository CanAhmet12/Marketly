import type { RecommendationFeedbackAction } from "./personalization-types";

import { personalizationStorageReadsSuppressed } from "./personalization-storage-gate";

const KEY = "marketly-recommendation-memory-v1";
const MAX = 48;

export type RecommendationMemoryState = {
  version: 1;
  hideCreatorIds: string[];
  lessCreatorIds: string[];
  followInterestCreatorIds: string[];
  interestedStrategies: string[];
  interestedTimeframes: string[];
  interestedMarketThemes: string[];
};

const empty: RecommendationMemoryState = {
  version: 1,
  hideCreatorIds: [],
  lessCreatorIds: [],
  followInterestCreatorIds: [],
  interestedStrategies: [],
  interestedTimeframes: [],
  interestedMarketThemes: [],
};

function cap<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

function read(): RecommendationMemoryState {
  if (typeof window === "undefined" || personalizationStorageReadsSuppressed()) return { ...empty };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const o = JSON.parse(raw) as Partial<RecommendationMemoryState>;
    if (!o || o.version !== 1) return { ...empty };
    return {
      version: 1,
      hideCreatorIds: Array.isArray(o.hideCreatorIds) ? o.hideCreatorIds.filter(Boolean) : [],
      lessCreatorIds: Array.isArray(o.lessCreatorIds) ? o.lessCreatorIds.filter(Boolean) : [],
      followInterestCreatorIds: Array.isArray(o.followInterestCreatorIds) ? o.followInterestCreatorIds.filter(Boolean) : [],
      interestedStrategies: Array.isArray(o.interestedStrategies) ? o.interestedStrategies.map((s) => String(s).toLowerCase()).filter(Boolean) : [],
      interestedTimeframes: Array.isArray(o.interestedTimeframes) ? o.interestedTimeframes.map((s) => String(s).toLowerCase()).filter(Boolean) : [],
      interestedMarketThemes: Array.isArray(o.interestedMarketThemes) ? o.interestedMarketThemes.map((s) => String(s).toLowerCase()).filter(Boolean) : [],
    };
  } catch {
    return { ...empty };
  }
}

function write(s: RecommendationMemoryState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* */
  }
}

function addUnique(arr: string[], v: string, max: number) {
  return cap([...new Set([...arr, v])].filter(Boolean), max);
}

export function readRecommendationMemoryState(): RecommendationMemoryState {
  return read();
}

export function clearRecommendationMemoryStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* */
  }
}

export function applyRecommendationFeedbackAction(action: RecommendationFeedbackAction): RecommendationMemoryState {
  const prev = read();
  const next: RecommendationMemoryState = { ...prev };

  switch (action.type) {
    case "rec_follow_interest":
      next.followInterestCreatorIds = addUnique(next.followInterestCreatorIds, action.creatorId, MAX);
      next.lessCreatorIds = next.lessCreatorIds.filter((id) => id !== action.creatorId);
      break;
    case "rec_hide_creator":
      next.hideCreatorIds = addUnique(next.hideCreatorIds, action.creatorId, MAX);
      break;
    case "rec_less_creator":
      next.lessCreatorIds = addUnique(next.lessCreatorIds, action.creatorId, MAX);
      break;
    case "rec_interested_strategy":
      next.interestedStrategies = addUnique(next.interestedStrategies, action.strategyId, MAX);
      break;
    case "rec_interested_timeframe":
      next.interestedTimeframes = addUnique(next.interestedTimeframes, action.timeframeId, MAX);
      break;
    case "rec_interested_market_theme":
      next.interestedMarketThemes = addUnique(next.interestedMarketThemes, action.themeId, MAX);
      break;
    default:
      break;
  }

  write(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
  }
  return next;
}

export const RECOMMENDATION_MEMORY_STORAGE_KEY = KEY;
