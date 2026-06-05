import type { SupabaseClient } from "@supabase/supabase-js";

import { CREATOR_ASSET_PRESETS } from "@/features/creators/creators-filters";
import { pickFeaturedIds, pickLiveNowIds } from "@/features/creators/lib/build-creator-row";
import type { CreatorDirectoryPayload, CreatorDirectoryRow, CreatorContentFormat } from "@/features/creators/types";

type RpcCreatorRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tier: string | null;
  verified: boolean | null;
  follower_count: number | null;
  signal_accuracy: number | null;
  marketcoin: number | null;
  created_at: string | null;
  post_count: number | null;
  signal_count: number | null;
  active_signal_count: number | null;
  last_post_at: string | null;
  is_live: boolean | null;
};

function formatHandle(username: string): string {
  return username.startsWith("@") ? username : `@${username}`;
}

function mapRpcRow(row: RpcCreatorRow): CreatorDirectoryRow {
  const username = row.username?.trim() || "user";
  const formats: CreatorContentFormat[] = [];
  const formatCounts: Partial<Record<CreatorContentFormat, number>> = {};
  if ((row.post_count ?? 0) > 0) {
    formats.push("post");
    formatCounts.post = row.post_count ?? 0;
  }
  if ((row.signal_count ?? 0) > 0) {
    formats.push("signal");
    formatCounts.signal = row.signal_count ?? 0;
  }
  if (row.is_live) {
    formats.push("live");
    formatCounts.live = 1;
  }

  const createdAt = row.created_at ?? new Date().toISOString();
  const createdMs = new Date(createdAt).getTime();
  const rising = Date.now() - createdMs < 180 * 86_400_000;

  return {
    id: row.id,
    username,
    displayName: row.full_name?.trim() || username,
    handle: formatHandle(username),
    avatarUrl: row.avatar_url ?? null,
    bio: row.bio ?? null,
    tier: row.tier ?? "free",
    verified: Boolean(row.verified),
    followerCount: row.follower_count ?? 0,
    signalAccuracy: row.signal_accuracy ?? null,
    specialties: [],
    assetTags: [],
    contentFormats: formats,
    formatCounts,
    isLive: Boolean(row.is_live),
    liveHref: row.is_live ? `/channel/${encodeURIComponent(row.id)}` : null,
    latestHeadline: null,
    latestContentHref: row.last_post_at ? `/channel/${encodeURIComponent(row.id)}` : null,
    latestThumbnailUrl: null,
    activeSignalsCount: row.active_signal_count ?? 0,
    bestSignalSymbol: null,
    bestSignalConfidence: null,
    roomHref: `/channel/${encodeURIComponent(row.id)}?tab=rooms`,
    channelHref: `/channel/${encodeURIComponent(row.id)}`,
    editorPick: false,
    rising,
    createdAt,
  };
}

/** `get_creators_directory` RPC → CreatorDirectoryPayload */
export async function fetchCreatorsDirectory(
  client: SupabaseClient,
  _viewerId: string | null,
): Promise<CreatorDirectoryPayload> {
  try {
    const { data, error } = await client.rpc("get_creators_directory", { p_limit: 80 });
    if (error) {
      console.warn("[creators] get_creators_directory", error.message);
      return { creators: [], featuredIds: [], liveNowIds: [], assetPresets: CREATOR_ASSET_PRESETS };
    }
    const raw = Array.isArray(data) ? data : (typeof data === "string" ? JSON.parse(data) : data);
    const rows = (raw ?? []) as RpcCreatorRow[];
    const creators = rows.map(mapRpcRow);
    const featuredIds = pickFeaturedIds(creators);
    const withFeatured = creators.map((c) => ({
      ...c,
      editorPick: featuredIds.includes(c.id),
    }));
    return {
      creators: withFeatured,
      featuredIds,
      liveNowIds: pickLiveNowIds(withFeatured),
      assetPresets: CREATOR_ASSET_PRESETS,
    };
  } catch (e) {
    console.warn("[creators] fetch error", e);
    return { creators: [], featuredIds: [], liveNowIds: [], assetPresets: CREATOR_ASSET_PRESETS };
  }
}
