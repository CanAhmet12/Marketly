import type { SupabaseClient } from "@supabase/supabase-js";

import type { CloseFriendCandidate } from "@/features/close-friends/domain/types";
import { MOCK_PROFILES } from "@/mock/fixtures/profiles";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean | null;
};

function toCandidate(p: ProfileRow): CloseFriendCandidate {
  return {
    id: p.id,
    username: p.username ?? "user",
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    verified: Boolean(p.verified),
  };
}

export function fetchMockFollowingCandidates(excludeIds: Set<string>): CloseFriendCandidate[] {
  return MOCK_PROFILES.filter((p) => !excludeIds.has(p.id))
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      username: p.username,
      full_name: p.full_name ?? null,
      avatar_url: p.avatar_url ?? null,
      verified: p.verified,
    }));
}

export async function fetchFollowingCandidates(
  client: SupabaseClient,
  viewerId: string,
  excludeIds: Set<string>,
): Promise<CloseFriendCandidate[]> {
  try {
    const { data: follows, error } = await client
      .from("follows")
      .select("following_id")
      .eq("follower_id", viewerId)
      .order("created_at", { ascending: false })
      .limit(24);

    if (error || !follows?.length) {
      if (error) console.warn("[close-friends] fetchFollowingCandidates", error.message);
      return [];
    }

    const ids = follows.map((f) => f.following_id as string).filter((id) => !excludeIds.has(id));
    if (ids.length === 0) return [];

    const { data: profiles } = await client
      .from("profiles")
      .select("id, username, full_name, avatar_url, verified")
      .in("id", ids.slice(0, 12));

    const order = new Map(ids.map((id, i) => [id, i]));
    return ((profiles ?? []) as ProfileRow[])
      .map(toCandidate)
      .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))
      .slice(0, 8);
  } catch (e) {
    console.warn("[close-friends] fetchFollowingCandidates", e);
    return [];
  }
}
