import type { SupabaseClient } from "@supabase/supabase-js";

import type { TrustedMemberCard } from "@/features/close-friends/domain/types";

type CfRow = { friend_id: string; added_at: string | null };
type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean | null;
};

export async function fetchTrustedMembers(
  client: SupabaseClient,
  viewerId: string,
): Promise<{ members: TrustedMemberCard[]; profiles: ProfileRow[] }> {
  try {
    const { data: rows, error } = await client
      .from("close_friends")
      .select("friend_id, added_at")
      .eq("user_id", viewerId)
      .order("added_at", { ascending: false });

    if (error || !rows?.length) {
      if (error) console.warn("[close-friends] fetchTrustedMembers", error.message);
      return { members: [], profiles: [] };
    }

    const cfRows = rows as CfRow[];
    const ids = cfRows.map((r) => r.friend_id);
    const { data: profiles } = await client
      .from("profiles")
      .select("id, username, full_name, avatar_url, verified")
      .in("id", ids);

    const profileMap = new Map<string, ProfileRow>();
    for (const p of (profiles ?? []) as ProfileRow[]) {
      profileMap.set(p.id, p);
    }

    const members: TrustedMemberCard[] = cfRows
      .map((row, i) => {
        const p = profileMap.get(row.friend_id);
        if (!p) return null;
        return {
          id: p.id,
          username: p.username ?? "user",
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          verified: Boolean(p.verified),
          trust_line: i % 2 === 0 ? "Çekirdek güven katmanı" : "Özel yayın dairesinde",
          channel_href: `/channel/${encodeURIComponent(p.id)}`,
        };
      })
      .filter(Boolean) as TrustedMemberCard[];

    return { members, profiles: [...profileMap.values()] };
  } catch (e) {
    console.warn("[close-friends] fetchTrustedMembers", e);
    return { members: [], profiles: [] };
  }
}

export async function fetchIsCloseFriend(
  client: SupabaseClient,
  viewerId: string,
  friendId: string,
): Promise<boolean> {
  try {
    const { data } = await client
      .from("close_friends")
      .select("id")
      .eq("user_id", viewerId)
      .eq("friend_id", friendId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}
