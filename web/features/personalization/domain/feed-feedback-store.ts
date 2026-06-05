import type { FeedPost } from "@/features/feed/types";

import type { FeedRecommendationFeedbackAction } from "./personalization-types";

import { personalizationStorageReadsSuppressed } from "./personalization-storage-gate";

const KEY = "marketly-feed-feedback-v1";
const MAX_MUTES = 48;
const MAX_HIDE = 120;
const MAX_TOPIC = 36;
const MAX_MORE = 40;

export type FeedFeedbackState = {
  version: 1;
  muteCreators: string[];
  muteAssets: string[];
  hidePosts: string[];
  lessLikePostIds: string[];
  moreLikeCreatorIds: string[];
  interestedTopics: string[];
  notInterestedTopics: string[];
};

const empty: FeedFeedbackState = {
  version: 1,
  muteCreators: [],
  muteAssets: [],
  hidePosts: [],
  lessLikePostIds: [],
  moreLikeCreatorIds: [],
  interestedTopics: [],
  notInterestedTopics: [],
};

function cap<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

function read(): FeedFeedbackState {
  if (typeof window === "undefined" || personalizationStorageReadsSuppressed()) return { ...empty };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const o = JSON.parse(raw) as Partial<FeedFeedbackState>;
    if (!o || o.version !== 1) return { ...empty };
    return {
      version: 1,
      muteCreators: Array.isArray(o.muteCreators) ? o.muteCreators.filter(Boolean) : [],
      muteAssets: Array.isArray(o.muteAssets) ? o.muteAssets.map((x) => String(x).toUpperCase()).filter(Boolean) : [],
      hidePosts: Array.isArray(o.hidePosts) ? o.hidePosts.filter(Boolean) : [],
      lessLikePostIds: Array.isArray(o.lessLikePostIds) ? o.lessLikePostIds.filter(Boolean) : [],
      moreLikeCreatorIds: Array.isArray(o.moreLikeCreatorIds) ? o.moreLikeCreatorIds.filter(Boolean) : [],
      interestedTopics: Array.isArray(o.interestedTopics) ? o.interestedTopics.map((t) => t.toLowerCase()).filter(Boolean) : [],
      notInterestedTopics: Array.isArray(o.notInterestedTopics) ? o.notInterestedTopics.map((t) => t.toLowerCase()).filter(Boolean) : [],
    };
  } catch {
    return { ...empty };
  }
}

function write(s: FeedFeedbackState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* */
  }
}

export function readFeedFeedbackState(): FeedFeedbackState {
  return read();
}

export function clearFeedFeedbackStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* */
  }
}

export function isPostBlockedByFeedFeedback(p: FeedPost, fb: FeedFeedbackState): boolean {
  if (fb.hidePosts.includes(p.id)) return true;
  if (fb.muteCreators.includes(p.user_id)) return true;
  const t = p.asset_tag?.trim();
  if (t) {
    const ast = t.replace(/^#/, "").toUpperCase();
    if (fb.muteAssets.includes(ast)) return true;
  }
  return false;
}

export function applyFeedFeedbackAction(action: FeedRecommendationFeedbackAction): FeedFeedbackState {
  const prev = read();
  const next: FeedFeedbackState = { ...prev };

  const addUnique = (arr: string[], v: string, max: number) => cap([...new Set([...arr, v])].filter(Boolean), max);

  switch (action.type) {
    case "mute_creator":
      next.muteCreators = addUnique(next.muteCreators, action.creatorId, MAX_MUTES);
      break;
    case "mute_asset":
      next.muteAssets = addUnique(next.muteAssets, action.symbol.trim().toUpperCase(), MAX_MUTES);
      break;
    case "hide_post":
      next.hidePosts = addUnique(next.hidePosts, action.postId, MAX_HIDE);
      break;
    case "more_like":
      next.moreLikeCreatorIds = addUnique(next.moreLikeCreatorIds, action.creatorId, MAX_MORE);
      next.lessLikePostIds = next.lessLikePostIds.filter((id) => id !== action.postId);
      break;
    case "less_like":
      next.lessLikePostIds = addUnique(next.lessLikePostIds, action.postId, MAX_HIDE);
      break;
    case "interested_topic":
      next.interestedTopics = addUnique(next.interestedTopics, action.token.toLowerCase(), MAX_TOPIC);
      next.notInterestedTopics = next.notInterestedTopics.filter((t) => t !== action.token.toLowerCase());
      break;
    case "not_interested_topic":
      next.notInterestedTopics = addUnique(next.notInterestedTopics, action.token.toLowerCase(), MAX_TOPIC);
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

export const FEED_FEEDBACK_STORAGE_KEY = KEY;
