import { filterDiscoverPosts } from "@/features/feed/discover-feed-filters";
import { fetchDiscoverFeedPage, fetchHomeFeedPage } from "@/features/feed/fetch-home-feed";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type { HomeRepository } from "./home-repository";
import { buildLiveDiscoverSections } from "./build-live-discover-sections";
import type { DiscoverTab, HomeFeedMode, StoryRing } from "./types";
import type { FeedPost } from "@/features/feed/types";
import type { HomeSection, RecommendedCreatorCard } from "@/features/home/types";
import type { DiscoverSignalCardRow } from "@/features/signals/repository/types";

const STATIC_MARKET_PULSE: { label: string; href: string }[] = [
  { label: "BTC", href: "/results?q=BTC" },
  { label: "ETH", href: "/results?q=ETH" },
  { label: "XU100", href: "/results?q=XU100" },
  { label: "USDTRY", href: "/results?q=USDTRY" },
  { label: "XAUUSD", href: "/results?q=altın" },
  { label: "VIOP", href: "/results?q=viop" },
];

/**
 * Üretim: `fetch-home-feed` / `fetch-discover-feed` ile gönderi havuzu.
 * Keşfet üst bölümleri: `build-live-discover-sections` (gönderi + statik sembol kısayolları).
 * TODO: `getHomeSections` → RPC; `getTrendingSignals` → trend RPC; `getStories` → stories tablosu.
 */
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

  getHomeSections(_userId: string | null, _feedPosts: FeedPost[]): HomeSection[] {
    void _userId;
    void _feedPosts;
    return [];
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

  getDiscoverSections(tab: DiscoverTab, userId: string | null, discoverPosts: FeedPost[]): HomeSection[] {
    return buildLiveDiscoverSections(tab, userId, discoverPosts);
  }

  getTrendingVideos(userId: string | null): FeedPost[] {
    void userId;
    return [];
  }

  getDiscoverPulsePosts(userId: string | null): FeedPost[] {
    void userId;
    return [];
  }

  getTrendingSignals(): DiscoverSignalCardRow[] {
    return [];
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

  getLiveNow(userId: string | null): FeedPost[] {
    void userId;
    return [];
  }

  getStories(userId: string | null): StoryRing[] {
    void userId;
    return [];
  }
}
