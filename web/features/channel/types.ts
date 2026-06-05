/** Kanal sayfası — mobil `useProfile` / `usePosts` / `useSignals` ile hizalı tipler */

export type ChannelTabId = "overview" | "videos" | "pulse" | "posts" | "signals" | "live" | "playlists" | "discussions" | "rooms" | "about";

export interface ChannelProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  verified: boolean;
  tier: string;
  follower_count: number;
  following_count: number;
  signal_accuracy: number | null;
  streak_days: number;
  marketcoin: number;
  subscriber_count: number;
  subscription_price: number | null;
  created_at: string;
  updated_at: string | null;
  total_views?: number | null;
  specialties?: string[] | null;
  strategy_style?: string | null;
  website?: string | null;
  location?: string | null;
}

export interface ChannelPost {
  id: string;
  user_id: string;
  content: string;
  type: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  title: string | null;
  likes: number;
  comments: number;
  created_at: string;
  asset_tag: string | null;
  media_urls: unknown;
}

export interface ChannelSignal {
  id: string;
  creator_id: string;
  asset_id: string;
  symbol: string;
  direction: "BUY" | "SELL" | "HOLD";
  confidence: number;
  entry_price: number | null;
  target_price: number | null;
  stop_loss: number | null;
  timeframe: string;
  rationale: string | null;
  is_active: boolean;
  copies_count: number;
  likes_count: number;
  created_at: string;
  result: string | null;
}

export interface FollowState {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}
