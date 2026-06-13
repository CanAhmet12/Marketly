import { resolveCryptoSegmentLabel } from "@/features/markets/crypto/lib/crypto-segment-utils";
import { resolveAnalystBullBear } from "@/features/markets/crypto/detail/lib/resolve-analyst-bull-bear";
import type { CryptoSideRailPayload } from "@/features/markets/crypto/detail/lib/crypto-side-rail-types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

export function buildCryptoSideRail(bundle: AssetIntelligenceBundle): CryptoSideRailPayload {
  const sym = bundle.asset.symbol;
  const { bullPct, bearPct } = resolveAnalystBullBear(bundle);
  const communityBull = bundle.communitySurface.bullCommunityPct;
  const communityBear = bundle.communitySurface.bearCommunityPct;
  const communityVotes = Math.max(
    bundle.communitySurface.activeDiscussions * 12 + bundle.assetSignalCommunity.activeThreadPosts,
    bundle.discussionSystem.thesisThreads.reduce((s, t) => s + t.participantCount, 0),
    24,
  );

  const creatorRows =
    bundle.relatedCreators.length > 0
      ? bundle.relatedCreators.slice(0, 4)
      : bundle.topAnalysts.map((a) => ({
          id: a.analystId,
          display: a.display,
          username: a.analystId,
          avatarUrl: a.avatarUrl,
          verified: a.verified,
          role: a.bias === "bullish" ? "Boğa" : a.bias === "bearish" ? "Ayı" : "Analist",
          href: `/signals?asset=${encodeURIComponent(sym)}`,
        }));

  const signalChips = bundle.signals
    .filter((s) => s.is_active)
    .slice(0, 4)
    .map((s) => ({
      id: s.id,
      href: s.detail_href || `/signals?signal=${encodeURIComponent(s.id)}`,
      direction: s.direction,
      analyst: s.analyst.display,
      confidence: s.confidence,
    }));

  return {
    symbol: sym,
    segmentLabel: resolveCryptoSegmentLabel(sym),
    segmentHref: "/markets/category/crypto",
    bullPct,
    bearPct,
    analystBullPct: bullPct,
    analystBearPct: bearPct,
    communityBullPct: communityBull,
    communityBearPct: communityBear,
    communityVotes,
    activeSignals: bundle.signalSummary.activeTotal,
    agreementPct: bundle.symbolConsensus.agreementPct,
    signalChips,
    creators: creatorRows,
    peers: bundle.relatedNetwork.correlated.slice(0, 4),
    macroThemes: bundle.relatedNetwork.macroThemes.slice(0, 3),
    userHints: bundle.userContextHints,
    quickLinks: [
      { label: "Sinyal akışı", href: `/signals?asset=${encodeURIComponent(sym)}` },
      { label: "Keşfet", href: "/discover" },
      { label: "Ekonomik takvim", href: "/economic-calendar" },
      { label: "Kripto piyasaları", href: "/markets/category/crypto" },
      { label: "Fiyat alarmları", href: "/price-alerts" },
      { label: "Portföy", href: "/portfolio" },
    ],
  };
}
