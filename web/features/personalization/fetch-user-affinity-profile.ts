import type { SupabaseClient } from "@supabase/supabase-js";

import { affinityContextFromServerRow } from "./domain/affinity-merge";
import type { AffinityContext } from "./domain/personalization-types";

export type ServerAffinityProfile = {
  affinity: AffinityContext;
  mutedCreators: string[];
  boostedCreators: string[];
  lastUpdated: string | null;
};

type AffinityRow = {
  asset_affinity: Record<string, number> | null;
  creator_affinity: Record<string, number> | null;
  format_affinity: Record<string, number> | null;
  topic_affinity: Record<string, number> | null;
  muted_creators: string[] | null;
  boosted_creators: string[] | null;
  event_count: number | null;
  confidence: number | null;
  horizon_bias: number | null;
  diversity: number | null;
  last_updated: string | null;
};

/** Supabase RPC → sunucu affinity profili */
export async function fetchUserAffinityProfile(
  client: SupabaseClient,
  userId: string | null,
): Promise<ServerAffinityProfile | null> {
  if (!userId) return null;

  const { data, error } = await client.rpc("get_user_affinity_profile", {
    p_user_id: userId,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) return null;

  const row = data[0] as AffinityRow;
  return {
    affinity: affinityContextFromServerRow(row),
    mutedCreators: row.muted_creators ?? [],
    boostedCreators: row.boosted_creators ?? [],
    lastUpdated: row.last_updated,
  };
}
