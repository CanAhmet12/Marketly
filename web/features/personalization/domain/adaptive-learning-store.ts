import type { AffinityContext } from "./personalization-types";

import { personalizationStorageReadsSuppressed } from "./personalization-storage-gate";

const KEY = "marketly-adaptive-learning-v1";
const SESSION_MS = 3 * 60 * 60 * 1000;
const ECHO_MIN_MS = 8 * 60 * 1000;
const MAX_MAP = 56;

export type AdaptiveLearningStateV1 = {
  version: 1;
  updatedAt: number;
  sessionId: string;
  sessionStart: number;
  sessionCreatorHits: Record<string, number>;
  sessionAssetHits: Record<string, number>;
  sessionFormatHits: Record<string, number>;
  sessionTopicHits: Record<string, number>;
  creatorSkipWeight: Record<string, number>;
  themeSkipWeight: Record<string, number>;
  formatSkipWeight: Record<string, number>;
  creatorEngageWeight: Record<string, number>;
  ignoredCreatorIds: string[];
  ignoredThemeTokens: string[];
  ignoredFormats: string[];
  repeatSkips: number;
  repeatEngagements: number;
  explorationPulse: number;
  affinityEcho: { eventCount: number; horizonBias: number; diversity: number; ts: number } | null;
};

const empty: AdaptiveLearningStateV1 = {
  version: 1,
  updatedAt: 0,
  sessionId: "s0",
  sessionStart: 0,
  sessionCreatorHits: {},
  sessionAssetHits: {},
  sessionFormatHits: {},
  sessionTopicHits: {},
  creatorSkipWeight: {},
  themeSkipWeight: {},
  formatSkipWeight: {},
  creatorEngageWeight: {},
  ignoredCreatorIds: [],
  ignoredThemeTokens: [],
  ignoredFormats: [],
  repeatSkips: 0,
  repeatEngagements: 0,
  explorationPulse: 0,
  affinityEcho: null,
};

function capMap(m: Record<string, number>, max = MAX_MAP): Record<string, number> {
  const e = Object.entries(m).filter(([, v]) => v > 0);
  if (e.length <= max) return Object.fromEntries(e);
  e.sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(e.slice(0, max));
}

function newSessionId(): string {
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function decayWeights(m: Record<string, number>, factor: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(m)) {
    const nv = v * factor;
    if (nv > 0.08) out[k] = nv;
  }
  return capMap(out);
}

export function readAdaptiveLearningState(): AdaptiveLearningStateV1 {
  if (typeof window === "undefined" || personalizationStorageReadsSuppressed()) {
    return { ...empty, updatedAt: 0 };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty, updatedAt: 0 };
    const o = JSON.parse(raw) as Partial<AdaptiveLearningStateV1>;
    if (!o || o.version !== 1) return { ...empty, updatedAt: 0 };
    const now = Date.now();
    const hours = Math.min(72, Math.max(0, (now - (o.updatedAt ?? now)) / 3_600_000));
    const factor = Math.exp(-hours * 0.22);
    return {
      version: 1,
      updatedAt: o.updatedAt ?? now,
      sessionId: typeof o.sessionId === "string" ? o.sessionId : empty.sessionId,
      sessionStart: typeof o.sessionStart === "number" ? o.sessionStart : now,
      sessionCreatorHits: { ...(o.sessionCreatorHits ?? {}) },
      sessionAssetHits: { ...(o.sessionAssetHits ?? {}) },
      sessionFormatHits: { ...(o.sessionFormatHits ?? {}) },
      sessionTopicHits: { ...(o.sessionTopicHits ?? {}) },
      creatorSkipWeight: decayWeights({ ...(o.creatorSkipWeight ?? {}) }, factor),
      themeSkipWeight: decayWeights({ ...(o.themeSkipWeight ?? {}) }, factor),
      formatSkipWeight: decayWeights({ ...(o.formatSkipWeight ?? {}) }, factor),
      creatorEngageWeight: { ...(o.creatorEngageWeight ?? {}) },
      ignoredCreatorIds: Array.isArray(o.ignoredCreatorIds) ? o.ignoredCreatorIds.filter(Boolean) : [],
      ignoredThemeTokens: Array.isArray(o.ignoredThemeTokens) ? o.ignoredThemeTokens.map((t) => String(t).toLowerCase()).filter(Boolean) : [],
      ignoredFormats: Array.isArray(o.ignoredFormats) ? o.ignoredFormats.map((t) => String(t).toLowerCase()).filter(Boolean) : [],
      repeatSkips: typeof o.repeatSkips === "number" ? o.repeatSkips : 0,
      repeatEngagements: typeof o.repeatEngagements === "number" ? o.repeatEngagements : 0,
      explorationPulse: typeof o.explorationPulse === "number" ? o.explorationPulse : 0,
      affinityEcho:
        o.affinityEcho &&
        typeof o.affinityEcho.eventCount === "number" &&
        typeof o.affinityEcho.horizonBias === "number" &&
        typeof o.affinityEcho.diversity === "number" &&
        typeof o.affinityEcho.ts === "number"
          ? o.affinityEcho
          : null,
    };
  } catch {
    return { ...empty, updatedAt: 0 };
  }
}

function write(s: AdaptiveLearningStateV1) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...s, updatedAt: Date.now() }));
  } catch {
    /* */
  }
}

function dispatch() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
}

export function clearAdaptiveLearningStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* */
  }
}

export function touchAdaptiveSession(): AdaptiveLearningStateV1 {
  const s = readAdaptiveLearningState();
  const now = Date.now();
  if (!s.sessionStart || now - s.sessionStart > SESSION_MS) {
    const next: AdaptiveLearningStateV1 = {
      ...s,
      sessionId: newSessionId(),
      sessionStart: now,
      sessionCreatorHits: {},
      sessionAssetHits: {},
      sessionFormatHits: {},
      sessionTopicHits: {},
      explorationPulse: Math.min(6, s.explorationPulse + 1),
      updatedAt: now,
    };
    write(next);
    dispatch();
    return next;
  }
  return s;
}

export function mergeAffinityEcho(affinity: AffinityContext): AdaptiveLearningStateV1 {
  const s = readAdaptiveLearningState();
  const now = Date.now();
  const prev = s.affinityEcho;
  if (prev && now - prev.ts < ECHO_MIN_MS) return s;
  const next: AdaptiveLearningStateV1 = {
    ...s,
    affinityEcho: {
      eventCount: affinity.meta.eventCount,
      horizonBias: affinity.meta.horizonBias,
      diversity: affinity.meta.diversity,
      ts: now,
    },
    updatedAt: now,
  };
  write(next);
  return next;
}

export function persistAdaptiveLearningState(next: AdaptiveLearningStateV1): void {
  write({ ...next, updatedAt: Date.now() });
  dispatch();
}

export function applyAdaptiveLearningPatch(patch: (prev: AdaptiveLearningStateV1) => AdaptiveLearningStateV1): AdaptiveLearningStateV1 {
  const prev = readAdaptiveLearningState();
  const next = patch(prev);
  persistAdaptiveLearningState(next);
  return next;
}

export function adaptiveLearningDigest(s: AdaptiveLearningStateV1): string {
  return [
    s.sessionId,
    Object.keys(s.sessionCreatorHits).length,
    Object.values(s.sessionCreatorHits).reduce((a, b) => a + b, 0),
    s.repeatSkips,
    s.repeatEngagements,
    s.explorationPulse,
    s.affinityEcho?.eventCount ?? 0,
    s.affinityEcho?.horizonBias ?? 0,
    Math.round((s.updatedAt % 999983) / 1000),
  ].join(":");
}

export const ADAPTIVE_LEARNING_STORAGE_KEY = KEY;
