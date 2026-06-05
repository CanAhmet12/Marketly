import type { WatchFeedbackAction } from "./personalization-types";

import { personalizationStorageReadsSuppressed } from "./personalization-storage-gate";

const KEY = "marketly-watch-feedback-v1";
const MAX = 48;

export type WatchFeedbackState = {
  version: 1;
  morePostIds: string[];
  lessPostIds: string[];
  hideCreators: string[];
  hideTopics: string[];
  interestedFormats: string[];
  interestedThemes: string[];
};

const empty: WatchFeedbackState = {
  version: 1,
  morePostIds: [],
  lessPostIds: [],
  hideCreators: [],
  hideTopics: [],
  interestedFormats: [],
  interestedThemes: [],
};

function cap<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

function read(): WatchFeedbackState {
  if (typeof window === "undefined" || personalizationStorageReadsSuppressed()) return { ...empty };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const o = JSON.parse(raw) as Partial<WatchFeedbackState>;
    if (!o || o.version !== 1) return { ...empty };
    return {
      version: 1,
      morePostIds: Array.isArray(o.morePostIds) ? o.morePostIds.filter(Boolean) : [],
      lessPostIds: Array.isArray(o.lessPostIds) ? o.lessPostIds.filter(Boolean) : [],
      hideCreators: Array.isArray(o.hideCreators) ? o.hideCreators.filter(Boolean) : [],
      hideTopics: Array.isArray(o.hideTopics) ? o.hideTopics.map((t) => String(t).toLowerCase()).filter(Boolean) : [],
      interestedFormats: Array.isArray(o.interestedFormats) ? o.interestedFormats.map((f) => String(f).toLowerCase()).filter(Boolean) : [],
      interestedThemes: Array.isArray(o.interestedThemes) ? o.interestedThemes.map((t) => String(t).toLowerCase()).filter(Boolean) : [],
    };
  } catch {
    return { ...empty };
  }
}

function write(s: WatchFeedbackState) {
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

export function readWatchFeedbackState(): WatchFeedbackState {
  return read();
}

export function clearWatchFeedbackStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* */
  }
}

export function applyWatchFeedbackAction(action: WatchFeedbackAction): WatchFeedbackState {
  const prev = read();
  const next: WatchFeedbackState = { ...prev };

  switch (action.type) {
    case "more_watch_like":
      next.morePostIds = addUnique(next.morePostIds, action.postId, MAX);
      next.lessPostIds = next.lessPostIds.filter((id) => id !== action.postId);
      break;
    case "less_watch_like":
      next.lessPostIds = addUnique(next.lessPostIds, action.postId, MAX);
      break;
    case "hide_watch_creator":
      next.hideCreators = addUnique(next.hideCreators, action.creatorId, MAX);
      break;
    case "hide_watch_topic":
      next.hideTopics = addUnique(next.hideTopics, action.token.toLowerCase(), MAX);
      break;
    case "interested_watch_format":
      next.interestedFormats = addUnique(next.interestedFormats, action.format.toLowerCase(), MAX);
      break;
    case "interested_watch_theme":
      next.interestedThemes = addUnique(next.interestedThemes, action.themeId.toLowerCase(), MAX);
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

export const WATCH_FEEDBACK_STORAGE_KEY = KEY;
