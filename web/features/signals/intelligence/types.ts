/** Phase 1E — sinyal istihbarat ağı + analist sıralamaları (mock yapı, prod RPC ile değiştirilebilir) */

export type AnalystReputationScores = {
  trustScore: number;
  consistencyScore: number;
  convictionQuality: number;
  riskAdjustedPerformance: number;
  communityTrust: number;
  engagementQuality: number;
  premiumReputation: number;
  signalLongevity: number;
  specializationStrength: number;
  strategyQuality: number;
};

export type AnalystBadgeId =
  | "institutional_style"
  | "macro_specialist"
  | "momentum_trader"
  | "community_trusted"
  | "premium_strategist"
  | "veteran_analyst"
  | "rising_creator";

export type AnalystLeaderboardRow = {
  rank: number;
  analystId: string;
  display: string;
  avatarUrl: string | null;
  verified: boolean;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryHint?: string;
  badges: AnalystBadgeId[];
  href: string;
};

export type AnalystLeaderboardSection = {
  id: string;
  title: string;
  subtitle: string;
  rows: AnalystLeaderboardRow[];
};

export type MarketSignalIntelligence = {
  marketBias: "bullish" | "bearish" | "neutral";
  bullBearSplitPct: { bull: number; bear: number };
  activeDebateAssetCount: number;
  analystConcentrationTop: { symbol: string; sharePct: number }[];
  momentumLabel: string;
  conflictingClusters: number;
  themeAcceleration: string;
  overlapPairsLabel: string;
};

export type SymbolConsensusIntel = {
  symbol: string;
  agreementPct: number;
  confidenceAvg: number;
  bullishConcentrationPct: number;
  bearishConcentrationPct: number;
  splitSentiment: boolean;
  strongestConviction: number | null;
  activeAnalysts: number;
  conflictingThesisGroups: number;
};

export type AnalystReputationProfile = {
  analystId: string;
  display: string;
  headline: string;
  scores: AnalystReputationScores;
  badges: AnalystBadgeId[];
};

export const EMPTY_MARKET_SIGNAL_INTELLIGENCE: MarketSignalIntelligence = {
  marketBias: "neutral",
  bullBearSplitPct: { bull: 50, bear: 50 },
  activeDebateAssetCount: 0,
  analystConcentrationTop: [],
  momentumLabel: "—",
  conflictingClusters: 0,
  themeAcceleration: "—",
  overlapPairsLabel: "—",
};

export function emptySymbolConsensusIntel(symbol: string): SymbolConsensusIntel {
  return {
    symbol,
    agreementPct: 0,
    confidenceAvg: 0,
    bullishConcentrationPct: 0,
    bearishConcentrationPct: 0,
    splitSentiment: false,
    strongestConviction: null,
    activeAnalysts: 0,
    conflictingThesisGroups: 0,
  };
}
