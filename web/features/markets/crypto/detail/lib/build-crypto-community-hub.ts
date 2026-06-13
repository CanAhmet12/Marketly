import type { CryptoCommunityFeedRow, CryptoCommunityHubPayload, CryptoCommunityMetric } from "@/features/markets/crypto/detail/lib/crypto-community-types";
import type { AssetDiscussionItem, AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

const KIND_LABELS: Record<NonNullable<AssetDiscussionItem["kind"]>, string> = {
  thesis: "Tez",
  update: "Güncelleme",
  debate: "Tartışma",
  macro: "Makro",
  signal_followup: "Sinyal",
  quote: "Alıntı",
  cross_asset: "Çapraz",
};

function mapFeedRow(d: AssetDiscussionItem): CryptoCommunityFeedRow {
  return {
    id: d.id,
    href: d.href,
    creatorDisplay: d.creatorDisplay,
    avatarUrl: d.avatarUrl,
    verified: d.verified,
    content: d.content,
    sentiment: d.sentiment,
    kindLabel: d.kind ? KIND_LABELS[d.kind] : "Gönderi",
    likes: d.likes,
    replies: d.replies,
    tags: d.tags,
    createdAt: d.createdAt,
    live: d.live,
  };
}

export function buildCryptoCommunityHub(bundle: AssetIntelligenceBundle): CryptoCommunityHubPayload {
  const { discussionSystem, communitySurface, assetSignalCommunity, relatedNetwork } = bundle;
  const symbol = bundle.asset.symbol;

  const metrics: CryptoCommunityMetric[] = [
    {
      key: "debate",
      label: "Aktif tartışma",
      value: String(communitySurface.activeDiscussions),
      tone: "gold",
    },
    {
      key: "posts",
      label: "Gönderi",
      value: String(bundle.discussions.length),
    },
    {
      key: "media",
      label: "Medya",
      value: String(bundle.media.length),
    },
    {
      key: "intensity",
      label: "Yoğunluk",
      value: String(communitySurface.debateIntensity),
    },
    {
      key: "threads",
      label: "Tez thread",
      value: String(discussionSystem.thesisThreads.length),
    },
    {
      key: "velocity",
      label: "Yanıt hızı 24s",
      value: String(assetSignalCommunity.replyVelocity24h),
      tone: assetSignalCommunity.replyVelocity24h >= 20 ? "gold" : "muted",
    },
  ];

  return {
    symbol,
    trendingThesisTitle: discussionSystem.trendingThesisTitle,
    crossAssetNarrative: discussionSystem.crossAssetNarrative,
    macroInterpretation: discussionSystem.macroInterpretation,
    premiumDiscussionHint: discussionSystem.premiumDiscussionHint,
    debateBullPct: discussionSystem.debateBullPct,
    debateBearPct: discussionSystem.debateBearPct,
    metrics,
    thesisThreads: discussionSystem.thesisThreads.slice(0, 6),
    feed: bundle.discussions.slice(0, 8).map(mapFeedRow),
    timeline: discussionSystem.timeline.slice(0, 8),
    quotes: communitySurface.notableQuotes.slice(0, 4),
    media: bundle.media.slice(0, 10),
    correlatedPeers: relatedNetwork.correlated.slice(0, 5),
    sentimentOverlap: relatedNetwork.sentimentOverlap,
    capitalRotationHint: relatedNetwork.capitalRotationHint,
  };
}

export function stanceLabel(stance: CryptoCommunityHubPayload["thesisThreads"][number]["stance"]): string {
  if (stance === "bullish") return "Boğa";
  if (stance === "bearish") return "Ayı";
  if (stance === "mixed") return "Karışık";
  return "Nötr";
}

export function stanceClass(stance: CryptoCommunityHubPayload["thesisThreads"][number]["stance"]): string {
  if (stance === "bullish") return "cd-community-stance--bull";
  if (stance === "bearish") return "cd-community-stance--bear";
  if (stance === "mixed") return "cd-community-stance--mixed";
  return "cd-community-stance--neutral";
}

export function timelineKindLabel(kind: CryptoCommunityHubPayload["timeline"][number]["kind"]): string {
  const m: Record<string, string> = {
    thesis: "Tez",
    creator: "Üretici",
    debate: "Tartışma",
    macro: "Makro",
    signal: "Sinyal",
  };
  return m[kind] ?? kind;
}
