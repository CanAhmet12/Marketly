import type { SupabaseClient } from "@supabase/supabase-js";

import { AlgoFlags } from "@/lib/algo-flags";

import type { AffinityContext } from "./domain/personalization-types";
import type { FeedFeedbackState } from "./domain/feed-feedback-store";

const DEBOUNCE_MS = 30_000;

let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let lastPayloadKey = "";

function payloadKey(ctx: AffinityContext, fb: FeedFeedbackState): string {
  return [
    ctx.meta.eventCount,
    ctx.meta.confidence.toFixed(3),
    Object.keys(ctx.creators).length,
    Object.keys(ctx.assets).length,
    fb.muteCreators.join(","),
    fb.moreLikeCreatorIds.join(","),
  ].join("|");
}

/** 30s debounce — Spotify near-real-time sync modeli */
export async function flushAffinityToServer(
  client: SupabaseClient,
  ctx: AffinityContext,
  fb: FeedFeedbackState,
): Promise<void> {
  if (!AlgoFlags.personalizationServerSync) return;

  const { error } = await client.rpc("upsert_user_affinity_profile", {
    p_asset_affinity: ctx.assets,
    p_creator_affinity: ctx.creators,
    p_format_affinity: ctx.formats,
    p_topic_affinity: ctx.topics,
    p_muted_creators: fb.muteCreators,
    p_boosted_creators: fb.moreLikeCreatorIds,
    p_event_count: ctx.meta.eventCount,
    p_confidence: ctx.meta.confidence,
    p_horizon_bias: ctx.meta.horizonBias,
    p_diversity: ctx.meta.diversity,
  });

  if (error && process.env.NODE_ENV === "development") {
    console.debug("[AffinitySync] upsert failed:", error.message);
  }
}

export function scheduleAffinitySync(
  client: SupabaseClient,
  ctx: AffinityContext,
  fb: FeedFeedbackState,
): void {
  if (!AlgoFlags.personalizationServerSync) return;
  if (typeof window === "undefined") return;

  const key = payloadKey(ctx, fb);
  if (key === lastPayloadKey && pendingTimer) return;

  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    lastPayloadKey = key;
    void flushAffinityToServer(client, ctx, fb);
  }, DEBOUNCE_MS);
}

export function resetAffinitySyncState(): void {
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = null;
  lastPayloadKey = "";
}
