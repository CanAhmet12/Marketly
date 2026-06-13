import type { AssetSymbolCommunityLive } from "@/features/markets/fetch-asset-symbol-community";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { AssetSignalCommunityPulse } from "@/features/signals/community/types";

function hasCommunityPayload(live: AssetSymbolCommunityLive): boolean {
  return live.discussions.length > 0 || live.media.length > 0 || live.thesisThreads.length > 0;
}

export function mergeAssetCommunityLive(
  bundle: AssetIntelligenceBundle,
  live: AssetSymbolCommunityLive,
): AssetIntelligenceBundle {
  if (!hasCommunityPayload(live)) return bundle;

  const discussions = live.discussions.length > 0 ? live.discussions : bundle.discussions;
  const media = live.media.length > 0 ? live.media : bundle.media;
  const thesisThreads =
    live.thesisThreads.length > 0 ? live.thesisThreads : bundle.discussionSystem.thesisThreads;

  const bullPosts = discussions.filter((d) => d.sentiment === "bullish").length;
  const bearPosts = discussions.filter((d) => d.sentiment === "bearish").length;
  const denom = Math.max(1, bullPosts + bearPosts);
  const debateBullPct =
    bullPosts + bearPosts > 0 ? Math.round((bullPosts / denom) * 100) : bundle.discussionSystem.debateBullPct;
  const debateBearPct = 100 - debateBullPct;

  const replyVelocity = discussions.reduce((s, d) => s + d.replies, 0);
  const sentimentParticipation = {
    bull: bullPosts,
    bear: bearPosts,
    neutral: Math.max(0, discussions.length - bullPosts - bearPosts),
  };

  const assetSignalCommunity: AssetSignalCommunityPulse = {
    activeThreadPosts: discussions.reduce((s, d) => s + d.replies, 0),
    hotSignalsCount: bundle.signalSummary.activeTotal,
    replyVelocity24h: replyVelocity,
    sentimentParticipation,
    analystConsensus:
      bundle.signalSummary.bullSharePct >= 55
        ? "bullish"
        : bundle.signalSummary.bullSharePct <= 45
          ? "bearish"
          : "mixed",
    trendingSnippet:
      discussions[0]?.content.slice(0, 72) + (discussions[0] && discussions[0].content.length > 72 ? "…" : "") ||
      bundle.assetSignalCommunity.trendingSnippet,
  };

  const notableQuotes = discussions.slice(0, 3).map((d) => ({
    quote: d.content.slice(0, 120) + (d.content.length > 120 ? "…" : ""),
    source: d.creatorDisplay,
    href: d.href,
  }));

  const timelineFromPosts = discussions.slice(0, 5).map((d) => ({
    id: `tl-post-${d.id}`,
    at: d.createdAt,
    label: d.kind === "thesis" ? "Tez güncellemesi" : "Topluluk gönderisi",
    detail: d.content.slice(0, 80) + (d.content.length > 80 ? "…" : ""),
    href: d.href,
    kind: (d.kind === "macro" ? "macro" : d.kind === "signal_followup" ? "signal" : "creator") as
      | "thesis"
      | "creator"
      | "debate"
      | "macro"
      | "signal",
  }));

  const timeline =
    timelineFromPosts.length > 0
      ? [...timelineFromPosts, ...bundle.discussionSystem.timeline].slice(0, 8)
      : bundle.discussionSystem.timeline;

  return {
    ...bundle,
    discussions,
    media,
    assetSignalCommunity,
    discussionSystem: {
      ...bundle.discussionSystem,
      thesisThreads,
      debateBullPct,
      debateBearPct,
      trendingThesisTitle:
        thesisThreads[0]?.title ??
        (discussions.length > 0
          ? `${bundle.asset.symbol} · ${discussions.length} topluluk gönderisi`
          : bundle.discussionSystem.trendingThesisTitle),
      crossAssetNarrative:
        discussions.length > 0
          ? `${discussions.length} gönderi ve ${media.length} medya içeriği bu sembol etrafında toplanıyor.`
          : bundle.discussionSystem.crossAssetNarrative,
      timeline,
    },
    communitySurface: {
      ...bundle.communitySurface,
      activeDiscussions: Math.max(bundle.communitySurface.activeDiscussions, discussions.length),
      recentCreatorUpdates: Math.max(bundle.communitySurface.recentCreatorUpdates, media.length),
      debateIntensity: Math.min(100, Math.max(bundle.communitySurface.debateIntensity, replyVelocity)),
      bullCommunityPct: debateBullPct,
      bearCommunityPct: debateBearPct,
      notableQuotes: notableQuotes.length > 0 ? notableQuotes : bundle.communitySurface.notableQuotes,
      relatedThreadHint:
        discussions.length > 0 ? `${discussions.length} canlı tartışma gönderisi` : bundle.communitySurface.relatedThreadHint,
    },
  };
}
