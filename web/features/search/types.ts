import type { DiscussionSearchHit } from "@/features/social/repository/discussion-types";
import type { CommunitySearchHit } from "@/features/social/repository/community-types";
import type { CreatorRoomSearchHit } from "@/features/social/repository/creator-room-types";
import type { ComposerReferenceHit } from "@/features/social/repository/composer-types";

/** Birleşik arama sekmeleri (11 → 5) */
export type SearchTabGroupId = "all" | "content" | "people" | "markets" | "community";

/** Eski deep link uyumluluğu */
export type SearchTabId =
  | "all"
  | "videos"
  | "pulse"
  | "live"
  | "posts"
  | "creators"
  | "signals"
  | "markets"
  | "discussions"
  | "communities"
  | "rooms";

export type { DiscussionSearchHit, CommunitySearchHit, CreatorRoomSearchHit };
export type { ComposerReferenceHit };

export type SearchPostHit = {
  id: string;
  user_id: string;
  type: string | null;
  content: string;
  title: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  created_at: string;
  likes: number;
  comments: number;
  views_count: number;
  duration: number | null;
  asset_tag: string | null;
  author_name: string;
  author_handle: string;
  author_avatar: string | null;
};

export type SearchChannelHit = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  follower_count: number;
  tier: string;
  verified: boolean;
  signal_accuracy: number | null;
  specialties: string[] | null;
  strategy_style: string | null;
};

export type SearchSignalHit = {
  id: string;
  creator_id: string;
  asset_id: string;
  symbol: string;
  direction: string;
  confidence: number;
  timeframe: string;
  rationale: string | null;
  created_at: string;
  creator_name: string;
  creator_avatar: string | null;
  entry_price: number | null;
  target_price: number | null;
};

export type SearchAssetHit = {
  id: string;
  symbol: string;
  name: string | null;
  change_pct?: number | null;
};

export type SearchResultBundle = {
  posts: SearchPostHit[];
  channels: SearchChannelHit[];
  signals: SearchSignalHit[];
  markets: SearchAssetHit[];
  discussions: DiscussionSearchHit[];
  communities: CommunitySearchHit[];
  creatorRooms: CreatorRoomSearchHit[];
  composerRefs: ComposerReferenceHit[];
};

export type SearchSplitPosts = {
  videos: SearchPostHit[];
  pulsePosts: SearchPostHit[];
  livePosts: SearchPostHit[];
  textPosts: SearchPostHit[];
};

export type SearchTabCounts = {
  all: number;
  content: number;
  people: number;
  markets: number;
  community: number;
};
