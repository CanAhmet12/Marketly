import { filterDiscoverPosts } from "@/features/feed/discover-feed-filters";
import { mockDiscoverFeedPage, mockHomeFeedPage } from "@/mock/adapters/feed";
import { getMockMarketPulseChips } from "@/mock/adapters/market-pulse";
import { MOCK_PROFILES } from "@/mock/fixtures/profiles";
import { MOCK_TREND_MARKETS } from "@/mock/fixtures/markets";
import { MOCK_STORY_RINGS } from "@/mock/fixtures/editorial-stories";

import type { HomeRepository } from "./home-repository";
import type { DiscoverTab, HomeFeedMode, StoryRing } from "./types";
import type { RecommendedCreatorCard } from "@/features/home/types";

function profileToRecommendedCreator(p: (typeof MOCK_PROFILES)[0]): RecommendedCreatorCard {
  const bio = p.bio?.trim() ?? "";
  const expertise = bio.length > 72 ? `${bio.slice(0, 72)}…` : bio || "Piyasa ve teknik akış";
  return {
    id: p.id,
    name: p.full_name ?? p.username,
    handle: `@${p.username}`,
    avatar_url: p.avatar_url,
    bio: p.bio,
    verified: p.verified,
    tier: p.tier,
    follower_count: p.follower_count,
    expertise,
  };
}

export class MockHomeRepository implements HomeRepository {
  async getHomeFeed(userId: string | null, mode: HomeFeedMode, page: number) {
    return mockHomeFeedPage(page, userId, mode);
  }

  async getFollowingFeed(userId: string | null, page: number) {
    return mockHomeFeedPage(page, userId, "following");
  }

  async getForYouFeed(userId: string | null, page: number) {
    return mockHomeFeedPage(page, userId, "for_you");
  }

  async getDiscoverFeedPage(userId: string | null, page: number) {
    return mockDiscoverFeedPage(page, userId);
  }

  async getDiscoverFeed(tab: DiscoverTab, userId: string | null) {
    const raw = await this.getDiscoverFeedPage(userId, 0);
    return {
      posts: filterDiscoverPosts(raw.posts, tab),
      hasMore: raw.hasMore,
    };
  }

  getRecommendedCreators(): RecommendedCreatorCard[] {
    return MOCK_PROFILES.slice(0, 12).map(profileToRecommendedCreator);
  }

  getMarketPulse() {
    return getMockMarketPulseChips();
  }

  getDiscoverMovers() {
    return [...MOCK_TREND_MARKETS]
      .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
      .slice(0, 14)
      .map((m) => ({ symbol: m.symbol, name: m.name, change_percent: m.change_percent }));
  }

  getStories(_userId: string | null): StoryRing[] {
    void _userId;
    return [...MOCK_STORY_RINGS];
  }
}
