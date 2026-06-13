import type { MarketAssetView } from "@/features/markets/types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

function symKey(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function hasValidLiveAsset(asset: MarketAssetView): boolean {
  return asset.price > 0 && asset.name.trim().length > 0 && asset.name !== "Veri bekleniyor";
}

function pickList<T>(live: readonly T[], mock: readonly T[]): T[] {
  return live.length > 0 ? [...live] : [...mock];
}

function isEmptyHeroIntel(hero: AssetIntelligenceBundle["heroIntel"]): boolean {
  return (
    hero.signalActivityLabel.startsWith("0 aktif") ||
    hero.activeAnalystsLabel.startsWith("0 analist") ||
    hero.sentimentPulse.includes("Canlı katman kapalı")
  );
}

function isEmptyDiscussionSystem(ds: AssetIntelligenceBundle["discussionSystem"]): boolean {
  return (
    ds.thesisThreads.length === 0 &&
    ds.timeline.length === 0 &&
    (ds.trendingThesisTitle.includes("bekleniyor") || ds.trendingThesisTitle.includes("Tartışma verisi"))
  );
}

function isEmptyRelatedNetwork(rn: AssetIntelligenceBundle["relatedNetwork"]): boolean {
  return rn.correlated.length === 0 && rn.themeClusters.length === 0 && rn.macroThemes.length === 0;
}

function isEmptyCreatorNetwork(cn: AssetIntelligenceBundle["creatorNetwork"]): boolean {
  return cn.topOnAsset.length === 0 && cn.rising.length === 0 && cn.mostCopied.length === 0;
}

function mergeAssetView(live: MarketAssetView, mock: MarketAssetView): MarketAssetView {
  if (!hasValidLiveAsset(live)) return { ...mock, symbol: live.symbol || mock.symbol };

  return {
    ...mock,
    ...live,
    sparkline: live.sparkline?.length ? live.sparkline : mock.sparkline,
    marketCapLabel:
      live.marketCapLabel && live.marketCapLabel !== "—" ? live.marketCapLabel : mock.marketCapLabel,
    volume: live.volume && live.volume !== "—" ? live.volume : mock.volume,
    signal_active_count: live.signal_active_count || mock.signal_active_count,
    signal_bull_pct: live.signal_active_count ? live.signal_bull_pct : mock.signal_bull_pct,
    signal_top_analyst: live.signal_top_analyst ?? mock.signal_top_analyst,
  };
}

/**
 * Canlı bundle öncelikli — yalnızca boş/placeholder katmanları mock ile tamamla.
 */
export function mergeMockAssetIntelligenceGaps(
  live: AssetIntelligenceBundle,
  mock: AssetIntelligenceBundle,
): AssetIntelligenceBundle {
  if (symKey(live.asset.symbol) !== symKey(mock.asset.symbol)) return live;

  const asset = mergeAssetView(live.asset, mock.asset);
  const signals = pickList(live.signals, mock.signals);
  const hasLiveSignals = live.signals.length > 0;

  return {
    ...mock,
    ...live,
    asset,
    categoryLabel: live.categoryLabel || mock.categoryLabel,
    session: live.session.headline.includes("—") && !live.session.detail ? mock.session : live.session,
    heroIntel: isEmptyHeroIntel(live.heroIntel) ? mock.heroIntel : live.heroIntel,
    signalSummary: hasLiveSignals ? live.signalSummary : mock.signalSummary,
    signalHub:
      hasLiveSignals || live.signalHub.discussionIntensity > 0 ? live.signalHub : mock.signalHub,
    confidenceBins:
      live.confidenceBins.high + live.confidenceBins.mid + live.confidenceBins.low > 0
        ? live.confidenceBins
        : mock.confidenceBins,
    topAnalysts: pickList(live.topAnalysts, mock.topAnalysts),
    signals,
    stats: pickList(live.stats, mock.stats),
    news: pickList(live.news, mock.news),
    discussions: pickList(live.discussions, mock.discussions),
    discussionSystem: isEmptyDiscussionSystem(live.discussionSystem)
      ? mock.discussionSystem
      : {
          ...mock.discussionSystem,
          ...live.discussionSystem,
          thesisThreads: pickList(live.discussionSystem.thesisThreads, mock.discussionSystem.thesisThreads),
          timeline: pickList(live.discussionSystem.timeline, mock.discussionSystem.timeline),
        },
    media: pickList(live.media, mock.media),
    relatedCreators: pickList(live.relatedCreators, mock.relatedCreators),
    chart: live.chart.timeframes.length > 0 ? live.chart : mock.chart,
    assetSignalCommunity:
      live.assetSignalCommunity.activeThreadPosts > 0 ||
      live.assetSignalCommunity.replyVelocity24h > 0
        ? live.assetSignalCommunity
        : mock.assetSignalCommunity,
    communitySurface:
      live.communitySurface.activeDiscussions > 0 ||
      live.communitySurface.notableQuotes.length > 0
        ? live.communitySurface
        : mock.communitySurface,
    creatorNetwork: isEmptyCreatorNetwork(live.creatorNetwork) ? mock.creatorNetwork : live.creatorNetwork,
    marketMemory:
      live.marketMemory.archivedCallsCount > 0 || live.marketMemory.notableDiscussions.length > 0
        ? live.marketMemory
        : mock.marketMemory,
    relatedNetwork: isEmptyRelatedNetwork(live.relatedNetwork) ? mock.relatedNetwork : live.relatedNetwork,
    userContextHints: {
      ...mock.userContextHints,
      ...live.userContextHints,
      watchlistRankLabel:
        live.userContextHints.watchlistRankLabel.includes("—") ||
        live.userContextHints.watchlistRankLabel.includes("yok")
          ? mock.userContextHints.watchlistRankLabel
          : live.userContextHints.watchlistRankLabel,
    },
    symbolConsensus:
      live.symbolConsensus.activeAnalysts > 0 || hasLiveSignals
        ? live.symbolConsensus
        : mock.symbolConsensus,
    marketSignalIntel:
      live.marketSignalIntel.activeDebateAssetCount > 0 ||
      live.marketSignalIntel.analystConcentrationTop.length > 0
        ? live.marketSignalIntel
        : mock.marketSignalIntel,
  };
}
