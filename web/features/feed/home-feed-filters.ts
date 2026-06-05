import type { FeedPost } from "@/features/feed/types";
import { isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";

/**
 * Ana akış (/) — yalnızca gönderi sekmeleri (Senin için, Takip).
 * Videolar, CANLI, Pulse ayrı sayfalarda: `/videos`, `/live`, `/pulse`.
 */
export type HomeFeedChipId = "for_you" | "following";

export const HOME_FEED_CHIP_IDS: HomeFeedChipId[] = ["for_you", "following"];

/** Eski URL çipleri — Keşfet veya ayrı sayfalara yönlendirilir. */
export const LEGACY_HOME_TO_DISCOVER_CHIPS = [
  "all",
  "trending",
  "bourse",
  "crypto",
  "signals",
  "posts",
  "shorts",
  "videos",  // → /discover?tab=videos
  "live",    // → /discover?tab=live
  "pulse",   // → /discover?tab=pulse
] as const;

export type LegacyHomeToDiscoverChip = (typeof LEGACY_HOME_TO_DISCOVER_CHIPS)[number];

export function isHomeFeedChipId(s: string): s is HomeFeedChipId {
  return (HOME_FEED_CHIP_IDS as string[]).includes(s);
}

export function isLegacyHomeToDiscoverChip(s: string): s is LegacyHomeToDiscoverChip {
  return (LEGACY_HOME_TO_DISCOVER_CHIPS as readonly string[]).includes(s);
}

/** `?chip=` → home chip; `all` ve boş → for_you */
export function normalizeHomeChipParam(raw: string | null): HomeFeedChipId {
  if (!raw || raw === "all") return "for_you";
  if (isHomeFeedChipId(raw)) return raw;
  return "for_you";
}

export function legacyChipToDiscoverTab(raw: string): string {
  const map: Record<string, string> = {
    all: "trending",
    trending: "trending",
    crypto: "crypto",
    bourse: "bourse",
    signals: "signals",
    posts: "discussions",
    shorts: "pulse",
    videos: "videos",  // → /discover?tab=videos
    live: "live",      // → /discover?tab=live
    pulse: "pulse",    // → /discover?tab=pulse
  };
  return map[raw] ?? "trending";
}

/** Akışta video / canlı / sinyal karışmasın. */
export function isHomeTextFeedPost(p: FeedPost): boolean {
  if (isVideoLikePost(p)) return false;
  if (isSignalPost(p)) return false;
  return true;
}

export function filterHomePosts(posts: FeedPost[], chip: HomeFeedChipId): FeedPost[] {
  const copy = [...posts];
  switch (chip) {
    case "following":
    case "for_you":
      return copy.filter(isHomeTextFeedPost);
    default:
      return copy;
  }
}
