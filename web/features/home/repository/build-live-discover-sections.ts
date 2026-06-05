import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";
import type { FeedPost } from "@/features/feed/types";
import type { HomeSection } from "@/features/home/types";

/**
 * Canlı Keşfet: şerit + sekme içeriği yeterli; üst ek bölüm yok.
 * (İleride RPC ile sekme başına özet bağlanabilir.)
 */
export function buildLiveDiscoverSections(
  tab: DiscoverTabId,
  userId: string | null,
  discoverPosts: FeedPost[],
): HomeSection[] {
  void tab;
  void userId;
  void discoverPosts;
  return [];
}
