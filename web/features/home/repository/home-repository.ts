import type { FeedPost } from "@/features/feed/types";
import type { HomeSection, RecommendedCreatorCard } from "@/features/home/types";
import type { DiscoverSignalCardRow } from "@/features/signals/repository/types";

import type { DiscoverPayload, DiscoverTab, HomeFeedMode, HomeFeedPage, MarketPulseItem, StoryRing } from "./types";

/**
 * Ana sayfa + keşfet veri sözleşmesi — UI doğrudan mock adapter import etmez.
 * 
 * FAZ C: Home repository canonical hale getirildi.
 * CANONICAL HOME METHODS: Social timeline only (text/image posts)
 * DEPRECATED METHODS: Discovery content → DiscoverRepository/SignalsRepository/MarketsRepository
 */
export type HomeRepository = {
  // ────────────────────────────────────────────────────────────────────────────
  // CANONICAL HOME METHODS (Social Timeline)
  // ────────────────────────────────────────────────────────────────────────────
  
  /** Fetch home feed (for_you or following mode) */
  getHomeFeed(userId: string | null, mode: HomeFeedMode, page: number): Promise<HomeFeedPage>;
  
  /** Fetch following timeline (chronological) */
  getFollowingFeed(userId: string | null, page: number): Promise<HomeFeedPage>;
  
  /** Fetch for_you timeline (engagement-ranked) */
  getForYouFeed(userId: string | null, page: number): Promise<HomeFeedPage>;

  // ────────────────────────────────────────────────────────────────────────────
  // DEPRECATED METHODS (Mixed Discovery Content)
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * @deprecated FAZ C: Home is social timeline only, not section-based discovery.
   * Mixed sections (video_grid, pulse_rail, signal_deck, etc.) removed from Home.
   * Use Discover for media discovery surfaces.
   */
  getHomeSections(userId: string | null, feedPosts: FeedPost[]): HomeSection[];

  /**
   * @deprecated FAZ C: Discover methods should be in DiscoverRepository, not HomeRepository.
   * This method will be moved to DiscoverRepository in future refactor.
   */
  getDiscoverFeedPage(userId: string | null, page: number): Promise<HomeFeedPage>;

  /**
   * @deprecated FAZ C: Discover methods should be in DiscoverRepository, not HomeRepository.
   */
  getDiscoverFeed(tab: DiscoverTab, userId: string | null): Promise<DiscoverPayload>;

  /**
   * @deprecated FAZ C: Discover sections belong in DiscoverRepository.
   */
  getDiscoverSections(tab: DiscoverTab, userId: string | null, discoverPosts: FeedPost[]): HomeSection[];

  /**
   * @deprecated FAZ C: Video discovery belongs in DiscoverRepository.getTrendingVideos()
   */
  getTrendingVideos(userId: string | null): FeedPost[];

  /**
   * @deprecated FAZ C: Pulse discovery belongs in DiscoverRepository.getDiscoverPulsePosts()
   */
  getDiscoverPulsePosts(userId: string | null): FeedPost[];

  /**
   * @deprecated FAZ C: Signal discovery belongs in SignalsRepository.getTrendingSignals()
   */
  getTrendingSignals(): DiscoverSignalCardRow[];

  /**
   * @deprecated FAZ C: Creator discovery belongs in DiscoverRepository.getRecommendedCreators()
   */
  getRecommendedCreators(): RecommendedCreatorCard[];

  /**
   * @deprecated FAZ C: Market movers belong in MarketsRepository.getMarketMovers()
   * Note: tab=movers was removed from Discover in FAZ B
   */
  getDiscoverMovers(): Array<{ symbol: string; name: string; change_percent: number }>;

  /**
   * @deprecated FAZ C: Live discovery belongs in DiscoverRepository.getLiveNow()
   */
  getLiveNow(userId: string | null): FeedPost[];

  // ────────────────────────────────────────────────────────────────────────────
  // UTILITY METHODS (OK — Lightweight Context)
  // ────────────────────────────────────────────────────────────────────────────
  
  /** Fetch market pulse strip data (ticker utility) */
  getMarketPulse(): MarketPulseItem[];
  
  /** Fetch user stories (social ephemeral content) */
  getStories(userId: string | null): StoryRing[];
};
