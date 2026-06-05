import type { FeedPost } from "@/features/feed/types";
import {
  isLivePost,
  isLongVideoPost,
  isPulsePost,
} from "@/features/feed/feed-display";

/**
 * Keşfet yüzeyi — mobil DiscoverScreen CATEGORIES ile hizalı (Pulse, Video, Canlı, Sinyal, …).
 * 
 * CANONICAL TAXONOMY (app parity):
 * - trending (default)
 * - pulse (short-form <60s)
 * - videos (long-form >60s)
 * - live (real-time broadcasts)
 * - signals (trade signals)
 * - creators (creator discovery)
 * 
 * DEPRECATED (removed from primary discover):
 * - movers → moved to /markets or /discover trending
 * - discussions → deprecated (home text feed)
 * - crypto → deprecated (markets filter)
 * - bourse → deprecated (markets filter)
 */
export type DiscoverTabId =
  | "trending"
  | "pulse"
  | "videos"
  | "live"
  | "signals"
  | "creators";

export const DISCOVER_TAB_IDS: DiscoverTabId[] = [
  "trending",
  "pulse",
  "videos",
  "live",
  "signals",
  "creators",
];

/** `/discover` sayfası sekmeleri (canonical — app parity). */
export const DISCOVER_PAGE_TAB_IDS: DiscoverTabId[] = [
  "trending",
  "pulse",
  "videos",
  "live",
  "signals",
  "creators",
];

export function isDiscoverTabId(s: string): s is DiscoverTabId {
  return (DISCOVER_TAB_IDS as string[]).includes(s);
}

export function defaultDiscoverTab(): DiscoverTabId {
  return "trending";
}

/**
 * Keşfet — trend / kategori / tür filtreleri (tek gönderi havuzu üzerinde).
 * 
 * CANONICAL FILTERING (app parity):
 * - trending: Karışık keşif (sıralama kişiselleştirme katmanında)
 * - pulse: Short-form only (<60s, 9:16)
 * - videos: Long-form only (>60s, 16:9)
 * - live: Real-time broadcasts
 * - signals: Empty (separate signal discovery panel)
 * - creators: One representative post per creator (CreatorCard grid — not empty)
 */
export function filterDiscoverPosts(posts: FeedPost[], tab: DiscoverTabId): FeedPost[] {
  const copy = [...posts];
  switch (tab) {
    case "videos":
      return copy.filter((p) => isLongVideoPost(p));
    case "pulse":
      return copy.filter(isPulsePost);
    case "live":
      return copy.filter(isLivePost);
    case "signals":
      return []; // Signal discovery uses separate panel
    case "creators": {
      const sorted = copy.sort((a, b) => b.likes + b.comments * 2 - (a.likes + a.comments * 2));
      const seen = new Set<string>();
      const out: FeedPost[] = [];
      for (const p of sorted) {
        if (!p.user_id || seen.has(p.user_id)) continue;
        seen.add(p.user_id);
        out.push(p);
        if (out.length >= 28) break;
      }
      return out;
    }
    case "trending":
      return copy;
    default:
      return copy;
  }
}
