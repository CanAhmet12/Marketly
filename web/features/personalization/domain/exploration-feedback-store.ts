import type { ExplorationFeedbackAction } from "./personalization-types";

import { personalizationStorageReadsSuppressed } from "./personalization-storage-gate";

const KEY = "marketly-exploration-feedback-v1";
const MAX = 48;

export type ExplorationFeedbackState = {
  version: 1;
  hideTopics: string[];
  notInterestedCreators: string[];
  interestedCreators: string[];
  interestedThemes: string[];
  moreFingerprints: string[];
  lessFingerprints: string[];
};

const empty: ExplorationFeedbackState = {
  version: 1,
  hideTopics: [],
  notInterestedCreators: [],
  interestedCreators: [],
  interestedThemes: [],
  moreFingerprints: [],
  lessFingerprints: [],
};

function cap<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

function read(): ExplorationFeedbackState {
  if (typeof window === "undefined" || personalizationStorageReadsSuppressed()) return { ...empty };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const o = JSON.parse(raw) as Partial<ExplorationFeedbackState>;
    if (!o || o.version !== 1) return { ...empty };
    return {
      version: 1,
      hideTopics: Array.isArray(o.hideTopics) ? o.hideTopics.map((t) => String(t).toLowerCase()).filter(Boolean) : [],
      notInterestedCreators: Array.isArray(o.notInterestedCreators) ? o.notInterestedCreators.filter(Boolean) : [],
      interestedCreators: Array.isArray(o.interestedCreators) ? o.interestedCreators.filter(Boolean) : [],
      interestedThemes: Array.isArray(o.interestedThemes) ? o.interestedThemes.map((t) => String(t).toLowerCase()).filter(Boolean) : [],
      moreFingerprints: Array.isArray(o.moreFingerprints) ? o.moreFingerprints.filter(Boolean) : [],
      lessFingerprints: Array.isArray(o.lessFingerprints) ? o.lessFingerprints.filter(Boolean) : [],
    };
  } catch {
    return { ...empty };
  }
}

function write(s: ExplorationFeedbackState) {
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

export function readExplorationFeedbackState(): ExplorationFeedbackState {
  return read();
}

export function clearExplorationFeedbackStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* */
  }
}

export function applyExplorationFeedbackAction(action: ExplorationFeedbackAction): ExplorationFeedbackState {
  const prev = read();
  const next: ExplorationFeedbackState = { ...prev };

  switch (action.type) {
    case "more_exploration_like":
      next.moreFingerprints = addUnique(next.moreFingerprints, `post:${action.postId}`, MAX);
      next.moreFingerprints = addUnique(next.moreFingerprints, `creator:${action.creatorId}`, MAX);
      next.lessFingerprints = next.lessFingerprints.filter((x) => x !== `post:${action.postId}`);
      break;
    case "less_exploration_like":
      next.lessFingerprints = addUnique(next.lessFingerprints, `post:${action.postId}`, MAX);
      break;
    case "hide_exploration_topic":
      next.hideTopics = addUnique(next.hideTopics, action.token.toLowerCase(), MAX);
      break;
    case "not_interested_exploration_creator":
      next.notInterestedCreators = addUnique(next.notInterestedCreators, action.creatorId, MAX);
      break;
    case "interested_exploration_creator":
      next.interestedCreators = addUnique(next.interestedCreators, action.creatorId, MAX);
      next.notInterestedCreators = next.notInterestedCreators.filter((id) => id !== action.creatorId);
      break;
    case "interested_exploration_theme":
      next.interestedThemes = addUnique(next.interestedThemes, action.themeId.toLowerCase(), MAX);
      break;
    case "more_exploration_surface":
      next.moreFingerprints = addUnique(next.moreFingerprints, action.fingerprint, MAX);
      break;
    case "less_exploration_surface":
      next.lessFingerprints = addUnique(next.lessFingerprints, action.fingerprint, MAX);
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

export const EXPLORATION_FEEDBACK_STORAGE_KEY = KEY;
