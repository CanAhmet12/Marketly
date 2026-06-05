import type { PersonalizationEvent } from "./personalization-types";

import { personalizationStorageReadsSuppressed } from "./personalization-storage-gate";

const STORAGE_KEY = "marketly-interest-behavior-v1";
const MAX_EVENTS = 520;

export type BehaviorStoreSnapshot = {
  version: 1;
  events: PersonalizationEvent[];
};

const empty: BehaviorStoreSnapshot = { version: 1, events: [] };

function safeParse(raw: string | null): BehaviorStoreSnapshot {
  if (!raw) return { ...empty, events: [] };
  try {
    const o = JSON.parse(raw) as Partial<BehaviorStoreSnapshot>;
    if (!o || o.version !== 1 || !Array.isArray(o.events)) return { ...empty, events: [] };
    return { version: 1, events: o.events.filter(isEvent) };
  } catch {
    return { ...empty, events: [] };
  }
}

function isEvent(x: unknown): x is PersonalizationEvent {
  if (!x || typeof x !== "object") return false;
  const e = x as PersonalizationEvent;
  return typeof e.kind === "string" && typeof e.ts === "number";
}

export function readBehaviorStore(): BehaviorStoreSnapshot {
  if (typeof window === "undefined" || personalizationStorageReadsSuppressed()) return { ...empty, events: [] };
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function appendBehaviorEvent(event: PersonalizationEvent): BehaviorStoreSnapshot {
  if (typeof window === "undefined") return { ...empty, events: [] };
  const prev = safeParse(localStorage.getItem(STORAGE_KEY));
  const nextEvents = [...prev.events, { ...event, ts: event.ts || Date.now() }].slice(-MAX_EVENTS);
  const snap: BehaviorStoreSnapshot = { version: 1, events: nextEvents };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {
    /* quota */
  }
  return snap;
}

export function clearBehaviorStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* */
  }
}

export const BEHAVIOR_STORAGE_KEY = STORAGE_KEY;
