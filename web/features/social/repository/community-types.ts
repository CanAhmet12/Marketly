/** Konu / varlık toplulukları — UI yalnızca SocialRepository üzerinden okur. */

export type TopicSentimentBand = "bullish" | "bearish" | "mixed";

export type TopicCommunitySummary = {
  slug: string;
  label: string;
  blurb: string;
  heatScore: number;
  heatLabel: string;
  threadCount: number;
  creatorCount: number;
  analystPresenceLabel: string;
  sentimentBand: TopicSentimentBand;
  sentimentLabel: string;
  macroChainLabel: string | null;
  href: string;
  linkedSymbols: string[];
};

export type DiscoverTopicCommunitySurface = {
  intelligenceHeadline: string;
  trending: TopicCommunitySummary[];
  rising: TopicCommunitySummary[];
  creatorHeavy: TopicCommunitySummary[];
  fastestGrowing: TopicCommunitySummary[];
  premiumHints: { id: string; text: string; href: string }[];
  macroDebateTopics: TopicCommunitySummary[];
};

export type DiscoverMarketTopicBridge = {
  crossAssetChains: { id: string; leftSymbol: string; rightSymbol: string; intensityLabel: string; theme: string; href: string }[];
  topicChips: TopicCommunitySummary[];
};

export type CommunityContributorRow = {
  user_id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  contributor_score: number;
  is_creator: boolean;
};

export type AssetCommunitySignalPreview = {
  signal_id: string;
  href: string;
  direction: string;
  confidence: number;
  label: string;
};

export type AssetCommunityHubBundle = {
  symbol: string;
  momentum_label: string;
  sentiment_label: string;
  sentiment_band: TopicSentimentBand;
  thesis_split_label: string;
  participation_density_label: string;
  discussion_intensity_label: string;
  creator_concentration_label: string;
  active_rooms: { id: string; label: string; heat_label: string; href: string }[];
  top_contributors: CommunityContributorRow[];
  active_signals: AssetCommunitySignalPreview[];
  related_themes: TopicCommunitySummary[];
  overlapping_creators_note: string;
  network_edges: { id: string; text: string; href: string }[];
};

export type HomeTopicCommunityStrip = {
  trending_chips: TopicCommunitySummary[];
  rising_chips: TopicCommunitySummary[];
  creator_lane: TopicCommunitySummary[];
};

export type CommunitySearchHit = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  heat_label: string;
  href: string;
  sentiment_label: string;
  linked_symbols: string[];
};
