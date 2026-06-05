import type { FeedPost } from "@/features/feed/types";

/** Ürün bölümü — backend ileride aynı şekli dönebilir */
export type HomeSectionType =
  | "hero_market_pulse"
  | "video_grid"
  | "pulse_rail"
  | "signal_deck"
  | "text_discussion_stack"
  | "market_movers"
  | "live_now"
  | "recommended_creators"
  | "followed_creators"
  | "news_briefing";

/** Yerleşim ipucu — renderer / CSS seçimi */
export type HomeSectionLayout =
  | "strip"
  | "video_grid"
  | "rail_horizontal"
  | "rail_vertical_cards"
  | "signal_deck"
  | "text_stack"
  | "market_compact_grid"
  | "creator_grid"
  | "news_list";

export type SignalDeckRow = {
  id: string;
  postId: string;
  symbol: string;
  direction: "BUY" | "SELL" | "HOLD";
  entry_price: number | null;
  target_price: number | null;
  stop_loss: number | null;
  confidence: number;
  thesis: string;
  timeframe: string;
  creator_id: string;
  creator_name: string;
  creator_handle: string;
  creator_avatar: string | null;
  verified: boolean;
  chart_image_url: string | null;
};

export type MarketMoverRow = {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  volume: string;
  trend: "up" | "down" | "flat";
  href: string;
};

export type RecommendedCreatorCard = {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean;
  tier: string;
  follower_count: number;
  expertise: string;
};

export type HomeSectionItem =
  | { kind: "pulse_chip"; label: string; href: string }
  | { kind: "feed_post"; post: FeedPost; href: string }
  | { kind: "signal_row"; row: SignalDeckRow; href: string }
  | { kind: "creator_card"; creator: RecommendedCreatorCard; href: string }
  | { kind: "market_mover"; row: MarketMoverRow }
  | { kind: "news_line"; title: string; href: string; meta: string };

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  title: string;
  subtitle: string | null;
  items: HomeSectionItem[];
  layout: HomeSectionLayout;
  priority: number;
  seeAllHref: string | null;
};
