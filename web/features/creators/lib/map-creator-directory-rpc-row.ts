import { resolveCreatorAvatarUrl } from "@/features/creators/lib/resolve-creator-avatar";
import { liveHrefForPostId } from "@/features/live/live-href";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";
import type { CreatorContentFormat, CreatorDirectoryRow } from "@/features/creators/types";

export type CreatorsDirectoryRpcRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tier: string | null;
  verified: boolean | null;
  follower_count: number | null;
  signal_accuracy: number | null;
  signal_count: number | null;
  cover_url: string | null;
  is_live: boolean | null;
  live_post_id: string | null;
  live_title: string | null;
  live_thumbnail: string | null;
  latest_post_id: string | null;
  latest_title: string | null;
  latest_content: string | null;
  latest_type: string | null;
  latest_thumbnail: string | null;
  latest_asset_tag: string | null;
  pulse_count: number | null;
  video_count: number | null;
  live_post_count: number | null;
  signal_post_count: number | null;
  post_count: number | null;
  profile_created_at: string | null;
  composite_score?: number | null;
  rising_velocity?: number | null;
  latest_gain_pct?: number | null;
  follower_tier?: string | null;
};

function parseHandle(username: string | null, id: string): string {
  const raw = username?.trim() || id.slice(0, 8);
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function gridTitle(row: CreatorsDirectoryRpcRow): string | null {
  const title = row.latest_title?.trim();
  if (title) return title;
  const content = row.latest_content?.trim();
  if (content) return content.length > 96 ? `${content.slice(0, 96)}…` : content;
  if (row.is_live && row.live_title?.trim()) return row.live_title.trim();
  return null;
}

function contentHref(row: CreatorsDirectoryRpcRow): string | null {
  if (row.is_live && row.live_post_id) return liveHrefForPostId(row.live_post_id);
  if (!row.latest_post_id) return null;
  const type = row.latest_type ?? "post";
  if (type === "live") return liveHrefForPostId(row.latest_post_id);
  if (type === "video") return `/watch/${row.latest_post_id}`;
  if (type === "pulse" || type === "short") return pulseHrefForPostId(row.latest_post_id);
  return `/post/${row.latest_post_id}`;
}

function buildFormatCounts(row: CreatorsDirectoryRpcRow): Partial<Record<CreatorContentFormat, number>> {
  const counts: Partial<Record<CreatorContentFormat, number>> = {};
  if ((row.live_post_count ?? 0) > 0) counts.live = row.live_post_count!;
  if ((row.video_count ?? 0) > 0) counts.video = row.video_count!;
  if ((row.pulse_count ?? 0) > 0) counts.pulse = row.pulse_count!;
  if ((row.signal_post_count ?? 0) > 0) counts.signal = row.signal_post_count!;
  const generic = (row.post_count ?? 0) - (row.live_post_count ?? 0) - (row.video_count ?? 0) - (row.pulse_count ?? 0) - (row.signal_post_count ?? 0);
  if (generic > 0) counts.post = generic;
  return counts;
}

function buildContentFormats(counts: Partial<Record<CreatorContentFormat, number>>): CreatorContentFormat[] {
  return (Object.keys(counts) as CreatorContentFormat[]).filter((k) => (counts[k] ?? 0) > 0);
}

function buildAssetTags(row: CreatorsDirectoryRpcRow): string[] {
  const tag = row.latest_asset_tag?.replace(/^#/, "").trim().toUpperCase();
  return tag ? [tag] : [];
}

function buildSpecialties(row: CreatorsDirectoryRpcRow, assetTags: string[]): string[] {
  const accuracy = row.signal_accuracy ?? 0;
  const count = row.signal_count ?? 0;
  const parts: string[] = [];
  const asset = assetTags[0];
  if (asset) parts.push(asset);
  if (accuracy > 0) parts.push(`%${Math.round(accuracy)} isabet`);
  if (count > 0) parts.push(`${count} sinyal`);
  return parts.length > 0 ? [parts.join(" · ")] : [];
}

function pickContentThumbnail(row: CreatorsDirectoryRpcRow): string | null {
  if (row.is_live) {
    return row.live_thumbnail?.trim() || row.latest_thumbnail?.trim() || row.cover_url?.trim() || null;
  }
  return row.latest_thumbnail?.trim() || row.cover_url?.trim() || null;
}

export function mapCreatorsDirectoryRpcRow(row: CreatorsDirectoryRpcRow): CreatorDirectoryRow {
  const username = row.username?.trim() || row.id.slice(0, 8);
  const formatCounts = buildFormatCounts(row);
  const assetTags = buildAssetTags(row);
  const thumb = pickContentThumbnail(row);
  const displayName = row.full_name?.trim() || username;

  return {
    id: row.id,
    username,
    displayName,
    handle: parseHandle(row.username, row.id),
    avatarUrl: resolveCreatorAvatarUrl(row.avatar_url),
    bio: row.bio ?? null,
    tier: row.tier ?? "free",
    verified: Boolean(row.verified),
    followerCount: row.follower_count ?? 0,
    signalAccuracy: row.signal_accuracy ?? null,
    specialties: buildSpecialties(row, assetTags),
    assetTags,
    contentFormats: buildContentFormats(formatCounts),
    formatCounts,
    isLive: Boolean(row.is_live),
    liveHref: row.live_post_id ? liveHrefForPostId(row.live_post_id) : null,
    latestHeadline: gridTitle(row),
    latestContentHref: contentHref(row),
    latestThumbnailUrl: thumb,
    activeSignalsCount: row.signal_post_count ?? row.signal_count ?? 0,
    bestSignalSymbol: assetTags[0] ?? null,
    bestSignalConfidence: row.signal_accuracy ?? null,
    roomHref: `/channel/${row.id}?tab=rooms`,
    channelHref: `/channel/${row.id}`,
    editorPick: false,
    rising: false,
    createdAt: row.profile_created_at ?? "",
    compositeScore: row.composite_score ?? null,
    risingVelocity: row.rising_velocity ?? null,
    latestGainPct: row.latest_gain_pct ?? null,
    followerTier: row.follower_tier ?? null,
  };
}
