import type { FeedPost } from "@/features/feed/types";
import {
  gridCardTitle,
  isLivePost,
  isLongVideoPost,
  isPulsePost,
  isSignalPost,
  pickGridThumbnail,
  primaryContentHref,
} from "@/features/feed/feed-display";
import { liveHrefForPostId } from "@/features/live/live-href";
import type { RecommendedCreatorCard } from "@/features/home/types";
import type { CreatorContentFormat, CreatorDirectoryRow } from "@/features/creators/types";
import type { MockProfileRow } from "@/mock/fixtures/profiles";

function parseHandle(raw: string): string {
  const t = raw.trim();
  return t.startsWith("@") ? t : `@${t}`;
}

function formatKey(post: FeedPost): CreatorContentFormat | null {
  if (isLivePost(post)) return "live";
  if (isPulsePost(post)) return "pulse";
  if (isLongVideoPost(post)) return "video";
  if (isSignalPost(post)) return "signal";
  return "post";
}

export type CreatorPostEnrichment = {
  formatCounts: Partial<Record<CreatorContentFormat, number>>;
  contentFormats: CreatorContentFormat[];
  assetTags: string[];
  latestHeadline: string | null;
  latestContentHref: string | null;
  latestThumbnailUrl: string | null;
  isLive: boolean;
  liveHref: string | null;
  activeSignalsCount: number;
};

export function enrichCreatorFromPosts(userId: string, posts: FeedPost[]): CreatorPostEnrichment {
  const userPosts = posts.filter((p) => p.user_id === userId);
  const formatCounts: Partial<Record<CreatorContentFormat, number>> = {};
  const assetSet = new Set<string>();
  let activeSignalsCount = 0;

  for (const p of userPosts) {
    const key = formatKey(p);
    if (key) formatCounts[key] = (formatCounts[key] ?? 0) + 1;
    if (isSignalPost(p)) activeSignalsCount += 1;
    const tag = p.asset_tag?.replace(/^#/, "").trim().toUpperCase();
    if (tag) assetSet.add(tag);
  }

  const contentFormats = (Object.keys(formatCounts) as CreatorContentFormat[]).filter(
    (k) => (formatCounts[k] ?? 0) > 0,
  );

  const sorted = [...userPosts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const latest = sorted[0];
  const livePost = userPosts.find(isLivePost);

  return {
    formatCounts,
    contentFormats,
    assetTags: [...assetSet].slice(0, 8),
    latestHeadline: latest ? gridCardTitle(latest) : null,
    latestContentHref: latest ? primaryContentHref(latest) : null,
    latestThumbnailUrl: latest ? pickGridThumbnail(latest) : null,
    isLive: Boolean(livePost),
    liveHref: livePost ? liveHrefForPostId(livePost.id) : null,
    activeSignalsCount,
  };
}

export function mapRecommendedToDirectoryRow(
  c: RecommendedCreatorCard,
  enrich: CreatorPostEnrichment,
  flags?: { editorPick?: boolean; rising?: boolean },
): CreatorDirectoryRow {
  const username = c.handle.replace(/^@/, "") || c.id;
  return {
    id: c.id,
    username,
    displayName: c.name,
    handle: parseHandle(c.handle),
    avatarUrl: c.avatar_url,
    bio: c.bio,
    tier: c.tier ?? "free",
    verified: c.verified,
    followerCount: c.follower_count ?? 0,
    signalAccuracy: c.signal_accuracy ?? null,
    specialties: c.expertise ? [c.expertise] : [],
    assetTags: enrich.assetTags,
    contentFormats: enrich.contentFormats,
    formatCounts: enrich.formatCounts,
    isLive: enrich.isLive,
    liveHref: enrich.liveHref,
    latestHeadline: enrich.latestHeadline,
    latestContentHref: enrich.latestContentHref,
    latestThumbnailUrl: enrich.latestThumbnailUrl,
    activeSignalsCount: enrich.activeSignalsCount ?? c.signal_count ?? 0,
    bestSignalSymbol: enrich.assetTags[0] ?? null,
    bestSignalConfidence: c.signal_accuracy ?? null,
    roomHref: null,
    channelHref: `/channel/${c.id}`,
    editorPick: flags?.editorPick ?? false,
    rising: flags?.rising ?? false,
    createdAt: "",
  };
}

export function mapMockProfileToDirectoryRow(
  p: MockProfileRow,
  enrich: CreatorPostEnrichment,
  flags?: { editorPick?: boolean; rising?: boolean },
): CreatorDirectoryRow {
  return {
    id: p.id,
    username: p.username,
    displayName: p.full_name?.trim() || p.username,
    handle: `@${p.username}`,
    avatarUrl: p.avatar_url,
    bio: p.bio,
    tier: p.tier,
    verified: p.verified,
    followerCount: p.follower_count,
    signalAccuracy: p.signal_accuracy,
    specialties: p.specialties ?? [],
    assetTags: enrich.assetTags,
    contentFormats: enrich.contentFormats,
    formatCounts: enrich.formatCounts,
    isLive: enrich.isLive,
    liveHref: enrich.liveHref,
    latestHeadline: enrich.latestHeadline ?? p.strategy_style ?? null,
    latestContentHref: enrich.latestContentHref,
    latestThumbnailUrl: enrich.latestThumbnailUrl ?? p.cover_url,
    activeSignalsCount: enrich.activeSignalsCount,
    bestSignalSymbol: enrich.assetTags[0] ?? null,
    bestSignalConfidence: p.signal_accuracy,
    roomHref: `/channel/${p.id}?tab=rooms`,
    channelHref: `/channel/${p.id}`,
    editorPick: flags?.editorPick ?? false,
    rising: flags?.rising ?? false,
    createdAt: p.created_at,
  };
}
