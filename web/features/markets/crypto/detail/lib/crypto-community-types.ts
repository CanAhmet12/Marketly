import type {
  AssetDiscussionItem,
  AssetDiscussionTimelineEntry,
  AssetMediaItem,
  AssetThesisThreadRow,
} from "@/features/markets/types/asset-intelligence";

export type CryptoCommunityTabId = "thesis" | "feed" | "media" | "narrative";

export type CryptoCommunityMetric = {
  key: string;
  label: string;
  value: string;
  tone?: "bull" | "bear" | "gold" | "muted";
};

export type CryptoCommunityThesisRow = AssetThesisThreadRow;

export type CryptoCommunityFeedRow = {
  id: string;
  href: string;
  creatorDisplay: string;
  avatarUrl: string | null;
  verified: boolean;
  content: string;
  sentiment: AssetDiscussionItem["sentiment"];
  kindLabel: string;
  likes: number;
  replies: number;
  tags: string[];
  createdAt: string;
  live?: boolean;
};

export type CryptoCommunityTimelineRow = AssetDiscussionTimelineEntry;

export type CryptoCommunityQuoteRow = {
  quote: string;
  source: string;
  href: string;
};

export type CryptoCommunityMediaRow = AssetMediaItem;

export type CryptoCommunityHubPayload = {
  symbol: string;
  trendingThesisTitle: string;
  crossAssetNarrative: string;
  macroInterpretation: string;
  premiumDiscussionHint?: string;
  debateBullPct: number;
  debateBearPct: number;
  metrics: CryptoCommunityMetric[];
  thesisThreads: CryptoCommunityThesisRow[];
  feed: CryptoCommunityFeedRow[];
  timeline: CryptoCommunityTimelineRow[];
  quotes: CryptoCommunityQuoteRow[];
  media: CryptoCommunityMediaRow[];
  correlatedPeers: { symbol: string; correlationLabel: string; href: string }[];
  sentimentOverlap: string;
  capitalRotationHint: string;
};
