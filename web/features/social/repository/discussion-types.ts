/** Tartışma / thread zekâsı — UI yalnızca SocialRepository üzerinden okur. */

export type ThesisStance = "agree" | "disagree" | "neutral";

export type PostDiscussionContext = {
  viewerId: string | null;
  postAuthorId: string | null;
  assetTag: string | null;
};

export type DiscussionTimelineTag = "active" | "trending" | "creator" | "signal" | "macro" | "asset";

export type DiscussionTimelineRow = {
  id: string;
  label: string;
  sub: string;
  href: string;
  heat: number;
  tag: DiscussionTimelineTag;
};

export type PostDiscussionSidecar = {
  summary: string | null;
  continuationHref: string | null;
  timelineRows: DiscussionTimelineRow[];
  relatedPosts: { id: string; href: string; title: string; comments: number; asset_tag: string | null }[];
  relatedSignals: { id: string; href: string; symbol: string; label: string }[];
  activeParticipants: {
    user_id: string;
    name: string;
    handle: string;
    avatar: string | null;
    contributor_score: number;
    creator_responded: boolean;
  }[];
  networkHints: { id: string; text: string; href: string }[];
};

export type DiscoverDiscussionRail = {
  activeThreads: DiscussionTimelineRow[];
  trendingTopics: { id: string; label: string; href: string; score: string }[];
  creatorActive: DiscussionTimelineRow[];
};

export type DiscussionSearchHit = {
  id: string;
  post_id: string;
  title: string;
  snippet: string;
  heat_label: string;
  reply_count: number;
  href: string;
  asset_tag: string | null;
  author_name: string;
  updated_at: string;
};

export type SignalLinkedDiscussionTeaser = {
  post_id: string;
  href: string;
  title: string;
  heat: string;
};

export type AssetDiscussionTeaser = {
  post_id: string;
  href: string;
  label: string;
  momentum: string;
};

export type ChannelDiscussionTeaser = {
  post_id: string;
  href: string;
  excerpt: string;
  comments: number;
  asset_tag: string | null;
  updated_at: string;
};

export type DiscussionReactionKind = "insightful" | "thanks" | "debate";

export type DiscussionReactionTally = Record<DiscussionReactionKind, number>;
