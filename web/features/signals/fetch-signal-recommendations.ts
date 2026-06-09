import type { SupabaseClient } from "@supabase/supabase-js";

import type { PersonalizedSignalRelevance, PersonalizedSignalRelevanceRow } from "@/features/signals/repository/types";
import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";

export type SignalRecommendationRpcRow = {
  signal_id: string;
  relevance_score: number;
  reason: string;
  asset_symbol: string;
  direction: string;
  confidence: number;
  creator_id: string;
  creator_username: string | null;
  creator_full_name: string | null;
  created_at: string;
};

export type CreatorRecommendationRpcRow = {
  creator_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  cofollow_score: number;
  composite_score: number | null;
};

function mapToRelevance(rows: SignalRecommendationRpcRow[]): PersonalizedSignalRelevance {
  if (!rows.length) {
    return { headline: "Henüz öneri yok — sinyal keşfedin", rows: [] };
  }
  const mapped: PersonalizedSignalRelevanceRow[] = rows.map((r) => ({
    id: r.signal_id,
    symbol: r.asset_symbol,
    direction: r.direction,
    confidence: r.confidence,
    analystDisplay: r.creator_full_name?.trim() || r.creator_username?.trim() || "Analist",
    href: `/signals?signal=${encodeURIComponent(r.signal_id)}`,
    reason: r.reason,
  }));
  return {
    headline: `Senin için ${mapped.length} öneri`,
    rows: mapped,
  };
}

/** `get_signal_recommendations` RPC — CF + affinity fallback */
export async function fetchSignalRecommendations(
  client: SupabaseClient,
  userId: string | null,
  limit = 10,
): Promise<PersonalizedSignalRelevance> {
  try {
    const { data, error } = await client.rpc("get_signal_recommendations", {
      p_user_id: userId,
      p_limit: limit,
    });
    if (error) {
      console.warn("[signals] get_signal_recommendations", error.message);
      return { headline: "Öneriler yüklenemedi", rows: [] };
    }
    return mapToRelevance(parseRpcRows<SignalRecommendationRpcRow>(data));
  } catch (e) {
    console.warn("[signals] fetchSignalRecommendations", e);
    return { headline: "Öneriler yüklenemedi", rows: [] };
  }
}

export async function fetchCreatorRecommendations(
  client: SupabaseClient,
  userId: string | null,
  limit = 5,
): Promise<CreatorRecommendationRpcRow[]> {
  if (!userId) return [];
  try {
    const { data, error } = await client.rpc("get_creator_recommendations", {
      p_user_id: userId,
      p_limit: limit,
    });
    if (error) {
      console.warn("[signals] get_creator_recommendations", error.message);
      return [];
    }
    return parseRpcRows<CreatorRecommendationRpcRow>(data);
  } catch (e) {
    console.warn("[signals] fetchCreatorRecommendations", e);
    return [];
  }
}

export async function logSignalInteraction(
  client: SupabaseClient,
  signalId: string,
  action: "view" | "like" | "copy" | "share" | "skip" = "view",
): Promise<void> {
  try {
    await client.rpc("log_signal_interaction", {
      p_signal_id: signalId,
      p_action: action,
    });
  } catch {
    /* non-blocking */
  }
}
