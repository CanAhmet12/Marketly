import type { CreatorDirectoryRow } from "@/features/creators/types";
import type { SearchChannelHit } from "@/features/search/types";

/** SearchChannelHit → CreatorDirectoryRow (partial — arama sonucu alanları) */
export function searchChannelToCreatorRow(hit: SearchChannelHit): CreatorDirectoryRow {
  const name = hit.full_name?.trim() || hit.username;
  return {
    id: hit.id,
    username: hit.username,
    displayName: name,
    handle: `@${hit.username}`,
    avatarUrl: hit.avatar_url,
    bio: hit.bio,
    tier: hit.tier ?? "free",
    verified: hit.verified,
    followerCount: hit.follower_count,
    signalAccuracy: hit.signal_accuracy,
    specialties: hit.specialties ?? [],
    assetTags: [],
    contentFormats: [],
    formatCounts: {},
    isLive: false,
    liveHref: null,
    latestHeadline: hit.strategy_style,
    latestContentHref: null,
    latestThumbnailUrl: null,
    activeSignalsCount: 0,
    bestSignalSymbol: null,
    bestSignalConfidence: null,
    roomHref: null,
    channelHref: `/channel/${hit.id}`,
    editorPick: false,
    rising: false,
    createdAt: "",
  };
}
