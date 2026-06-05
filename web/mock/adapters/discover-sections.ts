import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";
import type { FeedPost } from "@/features/feed/types";
import type { HomeSection } from "@/features/home/types";

/**
 * Mock Keşfet: üst şerit + sekme ızgarası yeterli; ek `HomeSection` yok
 * (Piyasa/üretici blokları ana akışla çakışmasın diye kaldırıldı).
 */
export function getMockDiscoverSections(
  tab: DiscoverTabId,
  viewerUserId: string | null,
  discoverPosts: FeedPost[],
): HomeSection[] {
  void tab;
  void viewerUserId;
  void discoverPosts;
  return [];
}
