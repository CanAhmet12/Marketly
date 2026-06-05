/** Davranış olayı — localStorage’da saklanır; üretimde edge ingest ile değiştirilebilir. */
export type PersonalizationContentFormat = "post" | "video" | "live" | "pulse" | "signal" | "discussion";

export type PersonalizationEventKind =
  | "content_view"
  | "asset_view"
  | "creator_view"
  | "watch_progress"
  | "engagement_like"
  | "engagement_comment"
  | "signal_copy"
  | "search_query"
  | "recommendation_click"
  | "room_open"
  | "discussion_open";

export type PersonalizationEvent = {
  kind: PersonalizationEventKind;
  ts: number;
  /** 0–1 arası kalite ağırlığı (izleme süresi, tekrar vb.) */
  quality?: number;
  creatorId?: string;
  assetSymbol?: string;
  topicToken?: string;
  signalId?: string;
  discussionId?: string;
  roomId?: string;
  contentFormat?: PersonalizationContentFormat;
  /** Arama metni — sunucuya gitmeden token’lara ayrıştırılır */
  query?: string;
  surface?: string;
};

export type AffinityContext = {
  /** 0–100 normalize skor */
  creators: Readonly<Record<string, number>>;
  assets: Readonly<Record<string, number>>;
  topics: Readonly<Record<string, number>>;
  signals: Readonly<Record<string, number>>;
  rooms: Readonly<Record<string, number>>;
  discussions: Readonly<Record<string, number>>;
  formats: Readonly<Record<string, number>>;
  meta: {
    eventCount: number;
    /** 0–1 model güveni */
    confidence: number;
    /** 0–1 çeşitlilik (tek varlığa yapışma tersi) */
    diversity: number;
    /** -1 kısa vade … +1 makro */
    horizonBias: number;
  };
};

export type InterestChip = {
  id: string;
  label: string;
  href: string;
  kind: "creator" | "asset" | "topic" | "theme" | "format" | "discussion";
};

export type InterestIntelligenceSnapshot = {
  headline: string;
  subline: string;
  /** Güçlü bağlar */
  strongest: InterestChip[];
  /** Son 7 günde ivme */
  rising: InterestChip[];
  /** Önceki döneme göre düşüş */
  fading: InterestChip[];
  /** Tema örtüşmesi (makro / kripto / BIST vb.) */
  marketThemes: { id: string; label: string; scoreLabel: string }[];
  /** Öneri güven etiketi */
  confidenceLabel: string;
  /** Makro vs kısa vade */
  horizonLabel: string;
  /** İçerik format tercihi */
  formatSummary: string;
  coldStart: boolean;
};

export type FeedRecommendationFeedbackAction =
  | { type: "mute_creator"; creatorId: string }
  | { type: "mute_asset"; symbol: string }
  | { type: "hide_post"; postId: string }
  | { type: "more_like"; postId: string; creatorId: string }
  | { type: "less_like"; postId: string }
  | { type: "interested_topic"; token: string }
  | { type: "not_interested_topic"; token: string };

/** Keşfet / arama keşfi — localStorage; ana akış geri bildiriminden ayrı */
export type ExplorationFeedbackAction =
  | { type: "more_exploration_like"; postId: string; creatorId: string }
  | { type: "less_exploration_like"; postId: string }
  | { type: "hide_exploration_topic"; token: string }
  | { type: "not_interested_exploration_creator"; creatorId: string }
  | { type: "interested_exploration_creator"; creatorId: string }
  | { type: "interested_exploration_theme"; themeId: string }
  | { type: "more_exploration_surface"; fingerprint: string }
  | { type: "less_exploration_surface"; fingerprint: string };

export type DiscoverExploreChip = {
  href: string;
  label: string;
  sub: string;
};

export type DiscoverExploreSurface = {
  new_discoveries: DiscoverExploreChip[];
  near_interest: DiscoverExploreChip[];
  rising_topics: DiscoverExploreChip[];
  unfollowed_suggestions: DiscoverExploreChip[];
  portfolio_linked: DiscoverExploreChip[];
  watchlist_linked: DiscoverExploreChip[];
  similar_creators: DiscoverExploreChip[];
  subline: string;
};

export type WatchFeedbackAction =
  | { type: "more_watch_like"; postId: string; creatorId: string }
  | { type: "less_watch_like"; postId: string }
  | { type: "hide_watch_creator"; creatorId: string }
  | { type: "hide_watch_topic"; token: string }
  | { type: "interested_watch_format"; format: string }
  | { type: "interested_watch_theme"; themeId: string };

export type WatchNextCandidate = {
  id: string;
  user_id: string;
  type: string | null;
  title: string | null;
  content: string;
  asset_tag: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  created_at: string;
  views_count: number;
  duration: number | null;
  comments?: number;
  likes?: number;
  discussion_anchor_post_id?: string | null;
};

export type WatchNextRankInput = {
  excludeId: string;
  preferUserId: string | null;
  playlistMemberOrder: string[] | null;
  currentAssetTag: string | null;
  currentType: string | null;
};

export type RecommendationFeedbackAction =
  | { type: "rec_follow_interest"; creatorId: string }
  | { type: "rec_hide_creator"; creatorId: string }
  | { type: "rec_less_creator"; creatorId: string }
  | { type: "rec_interested_strategy"; strategyId: string }
  | { type: "rec_interested_timeframe"; timeframeId: string }
  | { type: "rec_interested_market_theme"; themeId: string };
