import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";
import type { FeedPageResult } from "@/features/feed/types";
import type { RecommendedCreatorCard } from "@/features/home/types";

/** Ana akış modu — yalnızca gönderi akışı (Videolar / CANLI ayrı sayfalarda). */
export type HomeFeedMode = "for_you" | "following";

export type HomeFeedPage = FeedPageResult;

export type DiscoverTab = DiscoverTabId;

/** Keşfet sekmesi + tek sayfa sonuç (hasMore sonsuz kaydırma ile uyumlu) */
export type DiscoverPayload = FeedPageResult;

export type MarketPulseItem = { label: string; href: string };

export type RecommendedCreator = RecommendedCreatorCard;

export type StoryRing = {
  id: string;
  label: string;
  thumbnail_url: string | null;
  href: string;
};

export type { FeedPost } from "@/features/feed/types";
