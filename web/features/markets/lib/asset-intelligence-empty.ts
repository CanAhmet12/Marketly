import { buildSparklineSeries } from "@/features/markets/lib/sparkline-series";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { marketAssetCategoryLabelTr } from "@/features/markets/types/asset-intelligence";
import { inferMarketAssetCategory } from "@/lib/market-category";
import { EMPTY_ASSET_SIGNAL_COMMUNITY_PULSE } from "@/features/signals/community/types";
import { EMPTY_MARKET_SIGNAL_INTELLIGENCE, emptySymbolConsensusIntel } from "@/features/signals/intelligence/types";

const EMPTY_HERO: AssetIntelligenceBundle["heroIntel"] = {
  sentimentPulse: "Canlı katman kapalı — bağlandığında güncellenir.",
  consensusDirection: "neutral",
  volatilityRegime: "normal",
  volatilityLabel: "—",
  momentumLabel: "—",
  trendAcceleration: "steady",
  watchlistActivityLabel: "Takip verisi yok",
  premiumAnalystPct: 0,
  signalActivityLabel: "0 aktif çağrı",
  activeAnalystsLabel: "0 analist",
};

const EMPTY_SIGNAL_HUB: AssetIntelligenceBundle["signalHub"] = {
  lifecycleCounts: { active: 0, maturing: 0, archived: 0 },
  premiumVisibleCount: 0,
  publicCount: 0,
  copies24hTotal: 0,
  subscriberCopies24h: 0,
  discussionIntensity: 0,
  debateThreads: 0,
  creatorConcentrationPct: 0,
  thesisVarianceLabel: "—",
};

const EMPTY_DISCUSSION_SYSTEM: AssetIntelligenceBundle["discussionSystem"] = {
  trendingThesisTitle: "Tartışma verisi bekleniyor",
  thesisThreads: [],
  timeline: [],
  crossAssetNarrative: "API bağlandığında çapraz varlık tartışmaları burada özetlenir.",
  debateBullPct: 50,
  debateBearPct: 50,
  macroInterpretation: "—",
};

const EMPTY_CREATOR: AssetIntelligenceBundle["creatorNetwork"] = {
  topOnAsset: [],
  rising: [],
  institutionalStyle: [],
  macroSpecialists: [],
  mostCopied: [],
  concentrationTop3Pct: 0,
  timeline: [],
};

const EMPTY_COMMUNITY: AssetIntelligenceBundle["communitySurface"] = {
  activeDiscussions: 0,
  recentCreatorUpdates: 0,
  debateIntensity: 0,
  bullCommunityPct: 0,
  bearCommunityPct: 0,
  thesisDisagreements: 0,
  notableQuotes: [],
  relatedThreadHint: "Bağlantı kurulduğunda ilgili başlıklar listelenir.",
};

const EMPTY_MEMORY: AssetIntelligenceBundle["marketMemory"] = {
  signalOutcomes: { wins: 0, losses: 0, neutral: 0 },
  pastConsensusShifts: [],
  archivedCallsCount: 0,
  notableDiscussions: [],
  volatilityEpisodes: [],
  timeline: [],
};

const EMPTY_RELATED: AssetIntelligenceBundle["relatedNetwork"] = {
  correlated: [],
  themeClusters: [],
  macroThemes: [],
  analystOverlap: [],
  sentimentOverlap: "—",
  capitalRotationHint: "—",
};

const EMPTY_USER: AssetIntelligenceBundle["userContextHints"] = {
  watchlistRankLabel: "—",
  followedCreatorOverlap: 0,
  signalsFromFollowed: 0,
  portfolioRelevance: "Portföy bağlantısı bekleniyor.",
  pinBehaviorNote: "Sabitleme tarayıcıda saklanır.",
};

/** Supabase / boş katalog — tam sözleşme, UI güvenli */
export function emptyAssetIntelligenceBundle(rawSymbol: string): AssetIntelligenceBundle {
  const symbol = rawSymbol.trim().toUpperCase() || "—";
  const cat = inferMarketAssetCategory(symbol);
  const sparkline = buildSparklineSeries(symbol, "flat");
  const chartComps = ["BTC", "ETH", "NDX", "XU100", "USDTRY"].filter((s) => s !== symbol).slice(0, 4);
  return {
    asset: {
      id: `empty-asset-${symbol}`,
      symbol,
      name: "Veri bekleniyor",
      price: 0,
      change_percent: 0,
      volume: "—",
      trend: "flat",
      category: cat,
      marketCapLabel: "—",
      sparkline,
      signal_active_count: 0,
      signal_bull_pct: 50,
      signal_top_analyst: null,
    },
    categoryLabel: marketAssetCategoryLabelTr(cat),
    session: {
      headline: "Piyasa oturumu",
      detail: "Kotasyon ve istihbarat katmanı API ile dolduğunda bu sayfa canlanır.",
    },
    heroIntel: EMPTY_HERO,
    signalSummary: {
      activeTotal: 0,
      activeBuy: 0,
      activeSell: 0,
      activeHold: 0,
      avgConfidenceActive: 0,
      bullSharePct: 50,
      recentClosed: [],
    },
    signalHub: EMPTY_SIGNAL_HUB,
    confidenceBins: { high: 0, mid: 0, low: 0 },
    topAnalysts: [],
    signals: [],
    stats: [
      { key: "sym", label: "Sembol", value: symbol },
      { key: "cat", label: "Kategori", value: marketAssetCategoryLabelTr(cat) },
    ],
    news: [],
    discussions: [],
    discussionSystem: EMPTY_DISCUSSION_SYSTEM,
    media: [],
    relatedCreators: [],
    chart: {
      timeframes: [
        { id: "1S", label: "1S" },
        { id: "4S", label: "4S" },
        { id: "1G", label: "1G" },
        { id: "1H", label: "1H" },
        { id: "1A", label: "1A" },
      ],
      comparisonCandidates: chartComps.map((s) => ({ symbol: s, label: s })),
    },
    assetSignalCommunity: { ...EMPTY_ASSET_SIGNAL_COMMUNITY_PULSE },
    communitySurface: EMPTY_COMMUNITY,
    creatorNetwork: EMPTY_CREATOR,
    marketMemory: EMPTY_MEMORY,
    relatedNetwork: EMPTY_RELATED,
    userContextHints: EMPTY_USER,
    symbolConsensus: emptySymbolConsensusIntel(symbol),
    marketSignalIntel: { ...EMPTY_MARKET_SIGNAL_INTELLIGENCE },
  };
}
