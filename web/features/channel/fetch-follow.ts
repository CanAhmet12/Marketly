import type { SupabaseClient } from "@supabase/supabase-js";

import type { FollowState } from "./types";
import { isMockDataEnabled } from "@/mock/config";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";
import { mockFollowState } from "@/mock/adapters/channel";
import { logClientError } from "@/lib/errors/client-error-log";

/** Mobil `useFollow` ile aynı: `follows.follower_id` / `following_id` */
export async function fetchFollowState(
  client: SupabaseClient,
  viewerId: string | null,
  channelUserId: string,
): Promise<FollowState> {
  if (isMockDataEnabled()) {
    return mockFollowState(channelUserId);
  }

  try {
    const [followCheck, follCount, follwCount] = await Promise.all([
      viewerId
        ? client
            .from("follows")
            .select("id")
            .eq("follower_id", viewerId)
            .eq("following_id", channelUserId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      client
        .from("follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("following_id", channelUserId),
      client
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", channelUserId),
    ]);

    return {
      isFollowing: Boolean(followCheck.data),
      followersCount: follCount.count ?? 0,
      followingCount: follwCount.count ?? 0,
    };
  } catch (e) {
    logClientError("channel:fetchFollowState", e);
    return { isFollowing: false, followersCount: 0, followingCount: 0 };
  }
}

export async function insertFollow(
  client: SupabaseClient,
  followerId: string,
  followingId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (isMockDataEnabled()) {
    return { ok: true };
  }
  if (!isWebWriteEnabled()) {
    return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  }
  const { error } = await client.from("follows").insert({
    follower_id: followerId,
    following_id: followingId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteFollow(
  client: SupabaseClient,
  followerId: string,
  followingId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (isMockDataEnabled()) {
    return { ok: true };
  }
  if (!isWebWriteEnabled()) {
    return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  }
  const { error } = await client
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
