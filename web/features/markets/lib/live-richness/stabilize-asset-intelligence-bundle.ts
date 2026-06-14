import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

function sameListIds<T extends { id: string }>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i]?.id !== b[i]?.id) return false;
  }
  return true;
}

function sameIntelStructure(prev: AssetIntelligenceBundle, next: AssetIntelligenceBundle): boolean {
  return (
    prev.signalSummary.bullSharePct === next.signalSummary.bullSharePct &&
    prev.signalSummary.avgConfidenceActive === next.signalSummary.avgConfidenceActive &&
    prev.signalSummary.activeBuy === next.signalSummary.activeBuy &&
    prev.signalSummary.activeSell === next.signalSummary.activeSell &&
    prev.symbolConsensus.agreementPct === next.symbolConsensus.agreementPct &&
    prev.communitySurface.bullCommunityPct === next.communitySurface.bullCommunityPct &&
    prev.heroIntel.consensusDirection === next.heroIntel.consensusDirection &&
    sameListIds(prev.discussions, next.discussions) &&
    sameListIds(prev.news, next.news)
  );
}

/** Yalnızca fiyat alanları değiştiyse bundle referansını koru — sağ rail re-render dalgasını keser. */
export function stabilizeAssetIntelligenceBundle(
  prev: AssetIntelligenceBundle | null,
  next: AssetIntelligenceBundle,
): AssetIntelligenceBundle {
  if (!prev) return next;
  if (prev.asset.symbol.trim().toUpperCase() !== next.asset.symbol.trim().toUpperCase()) return next;
  if (!sameIntelStructure(prev, next)) return next;

  const priceSame =
    prev.asset.price === next.asset.price &&
    prev.asset.change_percent === next.asset.change_percent &&
    prev.asset.volume === next.asset.volume &&
    prev.asset.trend === next.asset.trend;

  if (priceSame) return prev;

  return {
    ...prev,
    asset: {
      ...prev.asset,
      price: next.asset.price,
      change_percent: next.asset.change_percent,
      volume: next.asset.volume,
      trend: next.asset.trend,
      sparkline: next.asset.sparkline?.length ? next.asset.sparkline : prev.asset.sparkline,
    },
  };
}
