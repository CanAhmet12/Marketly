import type { DiscoverPayload, DiscoverTab, HomeFeedMode, HomeFeedPage, MarketPulseItem, StoryRing } from "./types";
import type { RecommendedCreatorCard } from "@/features/home/types";

/**
 * Ana sayfa + keşfet veri sözleşmesi — UI doğrudan mock adapter import etmez.
 */
export type HomeRepository = {
  getHomeFeed(userId: string | null, mode: HomeFeedMode, page: number): Promise<HomeFeedPage>;
  getFollowingFeed(userId: string | null, page: number): Promise<HomeFeedPage>;
  getForYouFeed(userId: string | null, page: number): Promise<HomeFeedPage>;

  getDiscoverFeedPage(userId: string | null, page: number): Promise<HomeFeedPage>;
  getDiscoverFeed(tab: DiscoverTab, userId: string | null): Promise<DiscoverPayload>;

  getRecommendedCreators(): RecommendedCreatorCard[];
  getMarketPulse(): MarketPulseItem[];
  getDiscoverMovers(): Array<{ symbol: string; name: string; change_percent: number }>;
  getStories(userId: string | null): StoryRing[];
};
