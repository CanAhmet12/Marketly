/**
 * Mock Upload Persistence Store
 *
 * localStorage-backed store for content created in mock mode.
 * Persisted posts integrate into:
 * - Home feed (post type)
 * - Channel posts / signals tabs
 * - Studio content list
 */

import type { MockPostSource } from "@/mock/fixtures/posts";
import type { ChannelSignal } from "@/features/channel/types";

const POSTS_KEY = "marketly_mock_created_posts";
const SIGNALS_KEY = "marketly_mock_created_signals";

export type MockCreatedPost = MockPostSource;

export type MockCreatedSignal = ChannelSignal & { content: string; asset_tag: string | null };

function safeRead<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function safeWrite<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* storage full — silently skip */
  }
}

/** Add a newly created post to the persisted store */
export function addMockCreatedPost(post: MockCreatedPost): void {
  const existing = safeRead<MockCreatedPost>(POSTS_KEY);
  // Deduplicate by id
  const filtered = existing.filter((p) => p.id !== post.id);
  safeWrite(POSTS_KEY, [post, ...filtered]);
}

/** Get all persisted mock-created posts */
export function getMockCreatedPosts(): MockCreatedPost[] {
  return safeRead<MockCreatedPost>(POSTS_KEY);
}

/** Add a newly created signal */
export function addMockCreatedSignal(signal: MockCreatedSignal): void {
  const existing = safeRead<MockCreatedSignal>(SIGNALS_KEY);
  const filtered = existing.filter((s) => s.id !== signal.id);
  safeWrite(SIGNALS_KEY, [signal, ...filtered]);
}

/** Get all persisted mock-created signals */
export function getMockCreatedSignals(): MockCreatedSignal[] {
  return safeRead<MockCreatedSignal>(SIGNALS_KEY);
}

/** Clear all persisted mock-created content (used by settings reset) */
export function clearMockCreatedContent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(POSTS_KEY);
    localStorage.removeItem(SIGNALS_KEY);
  } catch {
    /* ignore */
  }
}
