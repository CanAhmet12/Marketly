import type { SupabaseClient } from "@supabase/supabase-js";

import { isMockDataEnabled } from "@/mock/config";
import { mockChannelFollowList } from "@/mock/adapters/channel";

export type ChannelFollowUser = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean;
  tier: string;
};

export type ChannelFollowListKind = "followers" | "following";

function mapProfileRow(raw: Record<string, unknown>): ChannelFollowUser {
  return {
    id: String(raw.id),
    username: String(raw.username ?? "user"),
    full_name: raw.full_name != null ? String(raw.full_name) : null,
    avatar_url: raw.avatar_url != null ? String(raw.avatar_url) : null,
    verified: Boolean(raw.verified),
    tier: String(raw.tier ?? "free"),
  };
}

/** Takipçi veya takip listesi — profiles join */
export async function fetchChannelFollowList(
  client: SupabaseClient,
  channelUserId: string,
  kind: ChannelFollowListKind,
  limit = 80,
): Promise<ChannelFollowUser[]> {
  if (isMockDataEnabled()) {
    return mockChannelFollowList(channelUserId, kind);
  }

  const idCol = kind === "followers" ? "follower_id" : "following_id";
  const filterCol = kind === "followers" ? "following_id" : "follower_id";

  const { data: edges, error } = await client
    .from("follows")
    .select(idCol)
    .eq(filterCol, channelUserId)
    .limit(limit);

  if (error) {
    console.warn("[channel] fetchChannelFollowList edges", error.message);
    return [];
  }

  const ids = (edges ?? [])
    .map((row) => (row as Record<string, unknown>)[idCol])
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  if (ids.length === 0) return [];

  const { data: profiles, error: profErr } = await client
    .from("profiles")
    .select("id, username, full_name, avatar_url, verified, tier")
    .in("id", ids);

  if (profErr) {
    console.warn("[channel] fetchChannelFollowList profiles", profErr.message);
    return [];
  }

  const byId = new Map((profiles ?? []).map((p) => [String((p as { id: string }).id), p as Record<string, unknown>]));
  return ids.map((id) => byId.get(id)).filter(Boolean).map((row) => mapProfileRow(row!));
}
