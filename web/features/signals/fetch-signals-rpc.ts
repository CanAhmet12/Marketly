import type { SupabaseClient } from "@supabase/supabase-js";

import type { AnalystLeaderboardRow, AnalystLeaderboardSection } from "@/features/signals/intelligence/types";

type LeaderboardRpcRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  signal_accuracy: number | null;
  follower_count: number | null;
  signal_count: number | null;
  tier?: string | null;
};

function mapRpcToLbRow(row: LeaderboardRpcRow, rank: number): AnalystLeaderboardRow {
  const display = row.full_name?.trim() || row.username?.trim() || "Analist";
  return {
    rank,
    analystId: row.id,
    display,
    avatarUrl: row.avatar_url ?? null,
    verified: Boolean(row.verified),
    primaryMetricLabel: "İsabet",
    primaryMetricValue: `${Math.round(row.signal_accuracy ?? 0)}%`,
    secondaryHint: `${row.signal_count ?? 0} sinyal · ${row.follower_count ?? 0} takipçi`,
    badges: row.verified ? ["community_trusted"] : [],
    href: `/channel/${row.id}`,
  };
}

/** `get_leaderboard_analysts` RPC → leaderboard section */
export async function fetchAnalystLeaderboardFromRpc(
  client: SupabaseClient,
  limit = 10,
): Promise<AnalystLeaderboardSection[]> {
  try {
    const { data, error } = await client.rpc("get_leaderboard_analysts", { p_limit: limit });
    if (error) {
      console.warn("[signals] get_leaderboard_analysts", error.message);
      return [];
    }
    const rows = (Array.isArray(data) ? data : []) as LeaderboardRpcRow[];
    if (!rows.length) return [];
    return [
      {
        id: "top_analysts_rpc",
        title: "Öne çıkan analistler",
        subtitle: "İsabet · sinyal · takipçi",
        rows: rows.map((r, i) => mapRpcToLbRow(r, i + 1)),
      },
    ];
  } catch (e) {
    console.warn("[signals] fetchAnalystLeaderboardFromRpc", e);
    return [];
  }
}
