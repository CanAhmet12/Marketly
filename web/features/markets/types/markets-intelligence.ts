import type { MarketSegmentId } from "@/features/markets/types";

/** Tablo / mover satırları — repository üzerinden */
export type MarketIntelMoverRow = {
  symbol: string;
  name: string;
  change_percent: number;
  volume: string;
  /** Küçük etiket: hacim, σ, sinyal vb. */
  metricHint?: string;
};

export type MarketsMoversBoard = {
  gainers: MarketIntelMoverRow[];
  losers: MarketIntelMoverRow[];
  highVolume: MarketIntelMoverRow[];
  highVolatility: MarketIntelMoverRow[];
  signalHeat: MarketIntelMoverRow[];
  analystAttention: MarketIntelMoverRow[];
};

/** SignalsRepository.getMarketSignalIntelligence + varlık türevleri */
export type MarketsSignalHeatSurface = {
  marketBias: "bullish" | "bearish" | "neutral";
  bullPct: number;
  bearPct: number;
  activeDebateAssetCount: number;
  momentumLabel: string;
  themeAcceleration: string;
  analystConcentrationTop: readonly { symbol: string; sharePct: number }[];
  topByActiveSignals: readonly {
    symbol: string;
    name: string;
    activeSignals: number;
    bullPct: number;
    convictionScore: number;
    discussionScore: number;
    copyScore: number;
    premiumAnalystPct: number;
  }[];
};

export type MarketsAnalystAttentionSurface = {
  analystFocusSymbols: readonly {
    symbol: string;
    name: string;
    analystTouches: number;
    discussionRising: boolean;
  }[];
  risingDiscussion: readonly { symbol: string; name: string; score: number }[];
  creatorHot: readonly { symbol: string; name: string; activityScore: number }[];
  /** Segment → en fazla 2 analist özeti */
  segmentLeaders: Partial<
    Record<
      Exclude<MarketSegmentId, "all" | "watchlist">,
      readonly { display: string; href: string; badge: string }[]
    >
  >;
};

export type MarketsSegmentNarratives = Partial<Record<MarketSegmentId, string>>;

/** Canlı piyasa sohbeti — repository / mock üretir */
export type MarketsLiveConversationPulse = {
  activeNowLabel: string;
  activeRoomsCount: number;
  fastMovingThreadCount: number;
  sentimentShiftLabel: string;
  macroFocusLabel: string;
  creatorsDiscussing: readonly { display: string; href: string; assetSymbol: string; live: boolean }[];
  breakingThemes: readonly string[];
};

/** Tartışma ağı özeti — piyasa ana sayfa + keşif şeridi */
export type MarketsCommunityIntelligenceSurface = {
  activeDiscussionCount: number;
  hottestDebates: readonly { symbol: string; name: string; score: number; stanceSplitLabel: string; href: string }[];
  mostWatched: readonly { symbol: string; name: string; watchersScore: number; href: string }[];
  risingCommunityAttention: readonly { symbol: string; name: string; deltaLabel: string; href: string }[];
  creatorOverlapLeaders: readonly { display: string; href: string; sharedAssetCount: number; topSymbol: string }[];
  discussionMomentumLabel: string;
  participationDensityPct: number;
  analystVsCommunitySplitLabel: string;
};

export type MarketCrossAssetDiscussionChain = {
  id: string;
  leftSymbol: string;
  rightSymbol: string;
  theme: string;
  intensityLabel: string;
  href: string;
};

export type MarketsDiscussionSocialKind =
  | "tracking"
  | "thesis_reaction"
  | "conviction_reaction"
  | "follow_discussion"
  | "creator_reply"
  | "copied_thesis"
  | "sentiment";

export type MarketsDiscussionSocialRow = {
  id: string;
  kind: MarketsDiscussionSocialKind;
  headline: string;
  detail: string;
  href: string;
  symbol?: string;
};

export type MarketsCommunityNetworkBundle = {
  live: MarketsLiveConversationPulse;
  community: MarketsCommunityIntelligenceSurface;
  crossAssetChains: readonly MarketCrossAssetDiscussionChain[];
  socialMechanics: readonly MarketsDiscussionSocialRow[];
};

export type MarketsIntelligenceSurface = {
  movers: MarketsMoversBoard;
  signalHeat: MarketsSignalHeatSurface;
  analystAttention: MarketsAnalystAttentionSurface;
  segmentNarratives: MarketsSegmentNarratives;
  liveConversation: MarketsLiveConversationPulse;
  communityIntel: MarketsCommunityIntelligenceSurface;
  crossAssetChains: readonly MarketCrossAssetDiscussionChain[];
  discussionSocialMechanics: readonly MarketsDiscussionSocialRow[];
};

export type WatchlistMarketsContext = {
  movers: MarketIntelMoverRow[];
  signalCountOnWatch: number;
  watchedCount: number;
  pinnedCount: number;
  avgAbsMovePct: number;
  /** Takip listesi ile kesişen tartışma köprüsü — boş olabilir */
  watchlistDiscussionBridge: { label: string; symbol: string; href: string } | null;
};

const EMPTY_LIVE: MarketsLiveConversationPulse = {
  activeNowLabel: "Canlı tartışma katmanı bekleniyor",
  activeRoomsCount: 0,
  fastMovingThreadCount: 0,
  sentimentShiftLabel: "—",
  macroFocusLabel: "—",
  creatorsDiscussing: [],
  breakingThemes: [],
};

const EMPTY_COMMUNITY_INTEL: MarketsCommunityIntelligenceSurface = {
  activeDiscussionCount: 0,
  hottestDebates: [],
  mostWatched: [],
  risingCommunityAttention: [],
  creatorOverlapLeaders: [],
  discussionMomentumLabel: "—",
  participationDensityPct: 0,
  analystVsCommunitySplitLabel: "—",
};

export function emptyMarketsIntelligenceSurface(): MarketsIntelligenceSurface {
  return {
    movers: {
      gainers: [],
      losers: [],
      highVolume: [],
      highVolatility: [],
      signalHeat: [],
      analystAttention: [],
    },
    signalHeat: {
      marketBias: "neutral",
      bullPct: 50,
      bearPct: 50,
      activeDebateAssetCount: 0,
      momentumLabel: "—",
      themeAcceleration: "—",
      analystConcentrationTop: [],
      topByActiveSignals: [],
    },
    analystAttention: {
      analystFocusSymbols: [],
      risingDiscussion: [],
      creatorHot: [],
      segmentLeaders: {},
    },
    segmentNarratives: {},
    liveConversation: EMPTY_LIVE,
    communityIntel: EMPTY_COMMUNITY_INTEL,
    crossAssetChains: [],
    discussionSocialMechanics: [],
  };
}

export function emptyMarketsCommunityNetworkBundle(): MarketsCommunityNetworkBundle {
  return {
    live: EMPTY_LIVE,
    community: EMPTY_COMMUNITY_INTEL,
    crossAssetChains: [],
    socialMechanics: [],
  };
}

export function emptyWatchlistMarketsContext(): WatchlistMarketsContext {
  return {
    movers: [],
    signalCountOnWatch: 0,
    watchedCount: 0,
    pinnedCount: 0,
    avgAbsMovePct: 0,
    watchlistDiscussionBridge: null,
  };
}
