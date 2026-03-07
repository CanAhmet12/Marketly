/**
 * Marketly — Supabase Veritabanı Tipleri
 *
 * Supabase CLI kullanılabildiğinde aşağıdaki komutla yenile:
 *   npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts
 *
 * Şimdilik ADD_TABLES.sql şemasından manuel türetilmiştir.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ─── Row types ────────────────────────────────────────────────────────────────

export interface Profile {
  id:               string;
  username:         string | null;
  full_name:        string | null;
  avatar_url:       string | null;
  cover_url:        string | null;
  bio:              string | null;
  tier:             'free' | 'pro' | 'elite' | null;
  verified:         boolean;
  referral_code:    string | null;
  streak_days:      number;
  last_login:       string | null;
  signal_accuracy:  number;
  push_token:       string | null;
  created_at:       string;
}

export interface Post {
  id:             string;
  user_id:        string;
  creator_id:     string | null;
  content:        string;
  asset_tag:      string | null;
  asset_tags:     string[] | null;
  image_url:      string | null;
  video_url:      string | null;
  thumbnail_url:  string | null;
  title:          string | null;
  description:    string | null;
  type:           'post' | 'video' | 'short' | 'live';
  duration:       number | null;
  likes:          number;
  likes_count:    number;
  comments:       number;
  comments_count: number;
  views_count:    number;
  shares_count:   number;
  is_premium:     boolean;
  created_at:     string;
}

export interface Signal {
  id:           string;
  creator_id:   string;
  asset_id:     string;
  direction:    'BUY' | 'SELL' | 'HOLD';
  confidence:   number;        // 0–100
  entry_price:  number | null;
  target_price: number | null;
  stop_loss:    number | null;
  timeframe:    string;
  rationale:    string | null;
  is_active:    boolean;
  copies_count: number;
  likes_count:  number;
  result:       string | null;
  created_at:   string;
}

export interface SignalLike {
  user_id:    string;
  signal_id:  string;
  created_at: string;
}

export interface SignalCopy {
  user_id:    string;
  signal_id:  string;
  created_at: string;
}

export interface PortfolioHolding {
  id:           string;
  user_id:      string;
  asset_id:     string;
  symbol:       string | null;
  name:         string | null;
  quantity:     number;
  avg_cost:     number;
  notes:        string | null;
  purchased_at: string;
  created_at:   string;
}

export interface PriceAlert {
  id:           string;
  user_id:      string;
  asset_id:     string;
  symbol:       string | null;
  condition:    'above' | 'below';
  direction:    string | null;
  target_price: number | null;
  target:       number | null;
  is_active:    boolean;
  triggered:    boolean;
  triggered_at: string | null;
  created_at:   string;
}

export interface Follow {
  follower_id:  string;
  following_id: string;
  created_at:   string;
}

export interface Notification {
  id:         string;
  user_id:    string;
  type:       'like' | 'comment' | 'follow' | 'signal' | 'market' | 'system' | 'price_alert';
  title:      string;
  body:       string;
  read:       boolean;
  meta:       Json | null;
  created_at: string;
}

export interface PostLike {
  user_id:    string;
  post_id:    string;
  created_at: string;
}

export interface VideoComment {
  id:         string;
  video_id:   string;
  user_id:    string;
  content:    string;
  likes:      number;
  is_pinned:  boolean;
  created_at: string;
}

export interface MarketcoinWallet {
  user_id:    string;
  balance:    number;
  updated_at: string;
}

export interface MarketcoinTransaction {
  id:         string;
  user_id:    string;
  amount:     number;
  type:       'earn' | 'spend' | 'gift';
  reason:     string | null;
  created_at: string;
}

export interface Badge {
  id:              string;
  name:            string;
  description:     string | null;
  icon:            string | null;
  condition_type:  string | null;
  condition_value: number | null;
  color:           string;
}

export interface UserBadge {
  user_id:   string;
  badge_id:  string;
  earned_at: string;
}

export interface PushToken {
  user_id:    string;
  token:      string;
  platform:   'android' | 'ios';
  updated_at: string;
}

export interface Asset {
  id:           string;
  symbol:       string;
  name:         string;
  category:     'crypto' | 'stocks' | 'forex' | 'commodity';
  logo_url:     string | null;
  logo_letter:  string | null;
  logo_color:   string | null;
}

export interface AssetPrice {
  asset_id:       string;
  price:          number;
  change_percent: number;
  volume:         number | null;
  high_24h:       number | null;
  low_24h:        number | null;
  market_cap:     number | null;
  ath:            number | null;
  updated_at:     string;
}

export interface AISession {
  id:         string;
  user_id:    string;
  title:      string | null;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id:         string;
  session_id: string;
  role:       'user' | 'assistant';
  content:    string;
  created_at: string;
}

export interface LiveMessage {
  id:         string;
  post_id:    string;
  user_id:    string;
  content:    string;
  type:       'text' | 'gift';
  gift_type:  string | null;
  created_at: string;
}

export interface SavedPost {
  user_id:    string;
  post_id:    string;
  created_at: string;
}

export interface Watchlist {
  user_id:    string;
  asset_id:   string;
  created_at: string;
}

// ─── Insert types (id, created_at opsiyonel) ──────────────────────────────────

export type InsertProfile             = Omit<Profile, 'id' | 'created_at' | 'streak_days' | 'verified' | 'signal_accuracy'> & Partial<Pick<Profile, 'id' | 'created_at' | 'streak_days' | 'verified' | 'signal_accuracy'>>;
export type InsertPost                = Omit<Post, 'id' | 'created_at' | 'likes' | 'likes_count' | 'comments' | 'comments_count' | 'views_count' | 'shares_count' | 'is_premium'> & Partial<Pick<Post, 'id' | 'created_at' | 'likes' | 'likes_count' | 'comments' | 'comments_count' | 'views_count' | 'shares_count' | 'is_premium'>>;
export type InsertSignal              = Omit<Signal, 'id' | 'created_at' | 'likes_count' | 'copies_count'> & Partial<Pick<Signal, 'id' | 'created_at' | 'likes_count' | 'copies_count'>>;
export type InsertPortfolioHolding    = Omit<PortfolioHolding, 'id' | 'created_at' | 'purchased_at'> & Partial<Pick<PortfolioHolding, 'id' | 'created_at' | 'purchased_at'>>;
export type InsertPriceAlert          = Omit<PriceAlert, 'id' | 'created_at' | 'is_active' | 'triggered'> & Partial<Pick<PriceAlert, 'id' | 'created_at' | 'is_active' | 'triggered'>>;
export type InsertNotification        = Omit<Notification, 'id' | 'created_at' | 'read'> & Partial<Pick<Notification, 'id' | 'created_at' | 'read'>>;
export type InsertVideoComment        = Omit<VideoComment, 'id' | 'created_at' | 'likes' | 'is_pinned'> & Partial<Pick<VideoComment, 'id' | 'created_at' | 'likes' | 'is_pinned'>>;
export type InsertMarketcoinTransaction = Omit<MarketcoinTransaction, 'id' | 'created_at'> & Partial<Pick<MarketcoinTransaction, 'id' | 'created_at'>>;

// ─── RPC return types ─────────────────────────────────────────────────────────

export interface ToggleSignalLikeResult {
  liked:     boolean;
  new_count: number;
}

export interface CopySignalOnceResult {
  copied:    boolean;
  new_count: number;
}
