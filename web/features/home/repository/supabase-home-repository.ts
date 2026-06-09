import { filterDiscoverPosts } from "@/features/feed/discover-feed-filters";
import { fetchDiscoverFeedPage, fetchHomeFeedPage } from "@/features/feed/fetch-home-feed";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type { HomeRepository } from "./home-repository";
import type { DiscoverTab, HomeFeedMode, StoryRing } from "./types";
import type { RecommendedCreatorCard } from "@/features/home/types";

const STATIC_MARKET_PULSE: { label: string; href: string }[] = [
  { label: "BTC", href: "/results?q=BTC" },
  { label: "ETH", href: "/results?q=ETH" },
  { label: "XU100", href: "/results?q=XU100" },
  { label: "USDTRY", href: "/results?q=USDTRY" },
  { label: "XAUUSD", href: "/results?q=altın" },
  { label: "VIOP", href: "/results?q=viop" },
];

export class SupabaseHomeRepository implements HomeRepository {
  async getHomeFeed(userId: string | null, mode: HomeFeedMode, page: number) {
    const client = getSupabaseBrowserClient();
    return fetchHomeFeedPage(client, page, userId, mode);
  }

  async getFollowingFeed(userId: string | null, page: number) {
    return this.getHomeFeed(userId, "following", page);
  }

  async getForYouFeed(userId: string | null, page: number) {
    return this.getHomeFeed(userId, "for_you", page);
  }

  async getDiscoverFeedPage(userId: string | null, page: number) {
    const client = getSupabaseBrowserClient();
    return fetchDiscoverFeedPage(client, page, userId);
  }

  async getDiscoverFeed(tab: DiscoverTab, userId: string | null) {
    const raw = await this.getDiscoverFeedPage(userId, 0);
    return {
      posts: filterDiscoverPosts(raw.posts, tab),
      hasMore: raw.hasMore,
    };
  }

  getRecommendedCreators(): RecommendedCreatorCard[] {
    return [];
  }

  getMarketPulse() {
    return STATIC_MARKET_PULSE;
  }

  getDiscoverMovers(): Array<{ symbol: string; name: string; change_percent: number }> {
    return [];
  }

  getStories(_userId: string | null): StoryRing[] {
    void _userId;
    return [];
  }
}
