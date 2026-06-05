/** Tartışma keşfi, kişiselleştirme ve ağ — UI yalnızca SocialRepository üzerinden okur. */

export type DiscussionEngagementQuality = "high" | "mid" | "low";

export type DiscussionIntelMetrics = {
  momentum: number;
  participation_velocity: string;
  creator_density: string;
  signal_overlap: string;
  market_overlap: string;
  thesis_split: string;
  engagement_quality: DiscussionEngagementQuality;
  network_propagation: string;
};

export type DiscussionDiscoveryTier =
  | "trending"
  | "rising"
  | "debate"
  | "market_mover"
  | "signal_chain"
  | "macro"
  | "fast_growing"
  | "creator_active";

export type DiscussionDiscoveryRow = {
  id: string;
  post_id: string;
  title: string;
  href: string;
  asset_tag: string | null;
  reason: string;
  metrics: DiscussionIntelMetrics;
  tier: DiscussionDiscoveryTier;
};

export type DiscussionDiscoverySurface = {
  headline: string;
  subline: string;
  trending: DiscussionDiscoveryRow[];
  rising: DiscussionDiscoveryRow[];
  creator_active: DiscussionDiscoveryRow[];
  active_debates: DiscussionDiscoveryRow[];
  market_moving: DiscussionDiscoveryRow[];
  signal_linked_chain: DiscussionDiscoveryRow[];
  macro_chains: DiscussionDiscoveryRow[];
  fast_growing: DiscussionDiscoveryRow[];
};

export type PersonalizedDiscussionInput = {
  viewerId: string | null;
  watchedSymbols: readonly string[];
  portfolioSymbols: readonly string[];
  followedCreatorIds: readonly string[];
};

export type PersonalizedDiscussionRow = {
  id: string;
  post_id: string;
  label: string;
  sub: string;
  href: string;
  relevance_reason: string;
  score_label: string;
};

export type PersonalizedDiscussionPack = {
  for_you: PersonalizedDiscussionRow[];
  watchlist: PersonalizedDiscussionRow[];
  followed_creators: PersonalizedDiscussionRow[];
  portfolio: PersonalizedDiscussionRow[];
  room_suggestions: { id: string; label: string; href: string; sub: string }[];
  topic_suggestions: { id: string; label: string; href: string }[];
};

export type DiscussionThreadEdge = "reply" | "quote" | "topic" | "signal" | "creator";

export type DiscussionThreadNetworkNode = {
  post_id: string;
  title: string;
  href: string;
  edge: DiscussionThreadEdge;
};

export type DiscussionThreadNetwork = {
  anchor_post_id: string;
  chain: DiscussionThreadNetworkNode[];
  related_discussions: DiscussionThreadNetworkNode[];
  cross_topic: { label: string; href: string }[];
};

export type CreatorDiscussionGravityRow = {
  creator_id: string;
  name: string;
  handle: string;
  href: string;
  momentum_score: number;
  active_threads: number;
  premium_badge: boolean;
  heat_label: string;
};

export type DiscussionRecommendationChip = {
  id: string;
  label: string;
  href: string;
};
