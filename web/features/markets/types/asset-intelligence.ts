import type { MarketAssetCategory, MarketAssetView } from "@/features/markets/types";
import type { AssetSignalCommunityPulse } from "@/features/signals/community/types";
import type { MarketSignalIntelligence, SymbolConsensusIntel } from "@/features/signals/intelligence/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

/** Haber — intelligence alanı (mock adapter üretir) */
export type AssetMarketNewsItem = {
  id: string;
  headline: string;
  source: string;
  minutesAgo: number;
  impact: 1 | 2 | 3;
  category: "macro" | "earnings" | "flows" | "policy" | "technical" | "other";
  sentiment: "positive" | "negative" | "neutral" | "mixed";
};

/** Tartışma satırı türü — gelecekte realtime thread ile hizalanır */
export type AssetDiscussionKind =
  | "thesis"
  | "update"
  | "debate"
  | "macro"
  | "signal_followup"
  | "quote"
  | "cross_asset";

/** Tartışma / analiz gönderisi — X + TV hissi, tek stack */
export type AssetDiscussionItem = {
  id: string;
  creatorId: string;
  creatorDisplay: string;
  creatorUsername: string;
  avatarUrl: string | null;
  verified: boolean;
  content: string;
  sentiment: "bullish" | "bearish" | "neutral";
  likes: number;
  replies: number;
  tags: string[];
  createdAt: string;
  href: string;
  kind?: AssetDiscussionKind;
  threadTitle?: string | null;
  live?: boolean;
  creatorReplied?: boolean;
  convictionReactions?: number;
  thesisFollowers?: number;
  trackingCount?: number;
};

export type AssetThesisThreadRow = {
  id: string;
  title: string;
  stance: "bullish" | "bearish" | "neutral" | "mixed";
  participantCount: number;
  lastActivityAt: string;
  intensity: number;
  href: string;
  trending?: boolean;
};

export type AssetDiscussionTimelineEntry = {
  id: string;
  at: string;
  label: string;
  detail: string;
  href: string;
  kind: "thesis" | "creator" | "debate" | "macro" | "signal";
};

/** Varlık tartışma sistemi — tez + zaman çizelgesi + çapraz akış */
export type AssetDiscussionSystem = {
  trendingThesisTitle: string;
  thesisThreads: AssetThesisThreadRow[];
  timeline: AssetDiscussionTimelineEntry[];
  crossAssetNarrative: string;
  debateBullPct: number;
  debateBearPct: number;
  macroInterpretation: string;
  premiumDiscussionHint?: string;
};

export type AssetMediaItem = {
  id: string;
  title: string;
  kind: "video" | "short" | "live";
  durationLabel: string | null;
  creatorDisplay: string;
  thumbnailUrl: string | null;
  viewsLabel: string;
  href: string;
  /** Kısa editoryal etiket — makro / recap / yorum */
  editorialIntent?: string;
};

export type AssetRelatedCreator = {
  id: string;
  display: string;
  username: string;
  avatarUrl: string | null;
  verified: boolean;
  role: string;
  href: string;
};

export type AssetStatRow = {
  key: string;
  label: string;
  value: string;
  /** Tooltip / alt açıklama */
  hint?: string;
};

export type AssetSignalConfidenceBins = {
  high: number;
  mid: number;
  low: number;
};

export type AssetSignalSummary = {
  activeTotal: number;
  activeBuy: number;
  activeSell: number;
  activeHold: number;
  avgConfidenceActive: number;
  bullSharePct: number;
  /** Son kapanan çağrılar (mock) */
  recentClosed: { id: string; direction: string; result: string | null; confidence: number; analyst: string; at: string }[];
};

export type AssetTopAnalyst = {
  analystId: string;
  display: string;
  avatarUrl: string | null;
  verified: boolean;
  activeCount: number;
  avgConfidence: number;
  bias: "bullish" | "bearish" | "mixed";
};

export type AssetMarketSession = {
  headline: string;
  detail: string;
};

export type AssetChartPreset = { id: string; label: string };

/** UI chart workbench — adapter sadece preset listesi verir; overlay state client’ta */
export type AssetChartWorkbenchModel = {
  timeframes: AssetChartPreset[];
  comparisonCandidates: { symbol: string; label: string }[];
};

/** Üst kahraman — kompakt istihbarat (repository/mock üretir) */
export type AssetHeroIntel = {
  sentimentPulse: string;
  consensusDirection: "bullish" | "bearish" | "neutral";
  volatilityRegime: "quiet" | "normal" | "expanded";
  volatilityLabel: string;
  momentumLabel: string;
  trendAcceleration: "cooling" | "steady" | "heating";
  watchlistActivityLabel: string;
  premiumAnalystPct: number;
  signalActivityLabel: string;
  activeAnalystsLabel: string;
};

export type AssetSignalHubDetail = {
  lifecycleCounts: { active: number; maturing: number; archived: number };
  premiumVisibleCount: number;
  publicCount: number;
  copies24hTotal: number;
  subscriberCopies24h: number;
  discussionIntensity: number;
  debateThreads: number;
  creatorConcentrationPct: number;
  thesisVarianceLabel: string;
};

export type AssetCreatorRanked = {
  analystId: string;
  display: string;
  href: string;
  avatarUrl: string | null;
  verified: boolean;
  badge: string;
  metric: string;
};

export type AssetCreatorNetwork = {
  topOnAsset: AssetCreatorRanked[];
  rising: AssetCreatorRanked[];
  institutionalStyle: AssetCreatorRanked[];
  macroSpecialists: AssetCreatorRanked[];
  mostCopied: AssetCreatorRanked[];
  concentrationTop3Pct: number;
  timeline: { at: string; label: string; analystDisplay: string; href: string | null }[];
};

export type AssetCommunitySurface = {
  activeDiscussions: number;
  recentCreatorUpdates: number;
  debateIntensity: number;
  bullCommunityPct: number;
  bearCommunityPct: number;
  thesisDisagreements: number;
  notableQuotes: { quote: string; source: string; href: string }[];
  relatedThreadHint: string;
};

export type AssetMarketMemoryEvent = {
  id: string;
  at: string;
  kind: "consensus_shift" | "signal_outcome" | "regime" | "vol_spike" | "debate" | "archived_call";
  label: string;
  detail: string;
};

export type AssetMarketMemory = {
  signalOutcomes: { wins: number; losses: number; neutral: number };
  pastConsensusShifts: { at: string; from: string; to: string }[];
  archivedCallsCount: number;
  notableDiscussions: { id: string; title: string; href: string }[];
  volatilityEpisodes: { periodLabel: string; maxSwingPct: string }[];
  timeline: AssetMarketMemoryEvent[];
};

export type AssetNetworkPeer = {
  symbol: string;
  correlationLabel: string;
  href: string;
};

export type AssetRelatedNetwork = {
  correlated: AssetNetworkPeer[];
  themeClusters: { label: string; symbols: string[] }[];
  macroThemes: string[];
  analystOverlap: { display: string; sharedSymbols: string; href: string }[];
  sentimentOverlap: string;
  capitalRotationHint: string;
};

export type AssetUserContextHints = {
  watchlistRankLabel: string;
  followedCreatorOverlap: number;
  signalsFromFollowed: number;
  portfolioRelevance: string;
  pinBehaviorNote: string;
};

/**
 * Varlık sayfası tek veri sözleşmesi — gerçek API’de aynı şekil JSON + repository.
 */
export type AssetIntelligenceBundle = {
  asset: MarketAssetView;
  categoryLabel: string;
  session: AssetMarketSession;
  heroIntel: AssetHeroIntel;
  signalSummary: AssetSignalSummary;
  signalHub: AssetSignalHubDetail;
  confidenceBins: AssetSignalConfidenceBins;
  topAnalysts: AssetTopAnalyst[];
  /** Bu varlık için sıralı sinyal satırları (feed row ile uyumlu) */
  signals: SignalsFeedRow[];
  stats: AssetStatRow[];
  news: AssetMarketNewsItem[];
  discussions: AssetDiscussionItem[];
  /** Tez / zaman çizelgesi / çapraz tartışma — repository */
  discussionSystem: AssetDiscussionSystem;
  media: AssetMediaItem[];
  relatedCreators: AssetRelatedCreator[];
  chart: AssetChartWorkbenchModel;
  /** Sinyal tartışma / thread topluluğu özeti — repository + mock */
  assetSignalCommunity: AssetSignalCommunityPulse;
  communitySurface: AssetCommunitySurface;
  creatorNetwork: AssetCreatorNetwork;
  marketMemory: AssetMarketMemory;
  relatedNetwork: AssetRelatedNetwork;
  userContextHints: AssetUserContextHints;
  /** UI SignalsRepository çağrısı yapmaz — bundle üzerinden */
  symbolConsensus: SymbolConsensusIntel;
  marketSignalIntel: MarketSignalIntelligence;
};

export function marketAssetCategoryLabelTr(c: MarketAssetCategory): string {
  const m: Record<MarketAssetCategory, string> = {
    crypto: "Kripto",
    stocks: "Hisse",
    forex: "Forex",
    commodity: "Emtia",
    index: "Endeks",
  };
  return m[c];
}
