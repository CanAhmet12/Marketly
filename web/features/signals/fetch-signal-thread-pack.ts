import type { SupabaseClient } from "@supabase/supabase-js";

export type SignalThreadPackRpc = {
  signal_id?: string;
  comment_count?: number;
  reply_count?: number;
  copies_24h?: number;
  likes_count?: number;
  copies_count?: number;
  bullish_count?: number;
  bearish_count?: number;
  creator_replied?: boolean;
  last_activity_at?: string;
};

/** `get_signal_thread_pack` — gerçek kopya/beğeni metrikleri */
export async function fetchSignalThreadPack(
  client: SupabaseClient,
  signalId: string,
): Promise<SignalThreadPackRpc | null> {
  const { data, error } = await client.rpc("get_signal_thread_pack", { p_signal_id: signalId });
  if (error) {
    console.warn("[signals] get_signal_thread_pack", error.message);
    return null;
  }
  if (data == null || typeof data !== "object") return null;
  return data as SignalThreadPackRpc;
}
