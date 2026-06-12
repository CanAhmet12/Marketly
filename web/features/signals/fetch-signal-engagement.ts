import type { SupabaseClient } from "@supabase/supabase-js";

export type SignalEngagementState = {
  likedIds: Set<string>;
  copiedIds: Set<string>;
};

export type ToggleLikeResult = {
  liked: boolean;
  new_count: number;
};

export type CopySignalResult = {
  copied: boolean;
  new_count: number;
};

/** Oturum açmış kullanıcının beğeni/kopya durumu */
export async function fetchUserSignalEngagement(
  client: SupabaseClient,
  userId: string,
): Promise<SignalEngagementState> {
  const [likesRes, copiesRes] = await Promise.all([
    client.from("signal_likes").select("signal_id").eq("user_id", userId),
    client.from("signal_copies").select("signal_id").eq("user_id", userId),
  ]);

  if (likesRes.error) console.warn("[signals] signal_likes", likesRes.error.message);
  if (copiesRes.error) console.warn("[signals] signal_copies", copiesRes.error.message);

  return {
    likedIds: new Set((likesRes.data ?? []).map((r) => String(r.signal_id))),
    copiedIds: new Set((copiesRes.data ?? []).map((r) => String(r.signal_id))),
  };
}

export async function rpcToggleSignalLike(
  client: SupabaseClient,
  userId: string,
  signalId: string,
): Promise<ToggleLikeResult | null> {
  const { data, error } = await client.rpc("toggle_signal_like", {
    p_user_id: userId,
    p_signal_id: signalId,
  });
  if (error) {
    console.warn("[signals] toggle_signal_like", error.message);
    return null;
  }
  const row = data as { liked?: boolean; new_count?: number } | null;
  return {
    liked: Boolean(row?.liked),
    new_count: Number(row?.new_count ?? 0),
  };
}

export async function rpcCopySignalOnce(
  client: SupabaseClient,
  userId: string,
  signalId: string,
): Promise<CopySignalResult | null> {
  const { data, error } = await client.rpc("copy_signal_once", {
    p_user_id: userId,
    p_signal_id: signalId,
  });
  if (error) {
    console.warn("[signals] copy_signal_once", error.message);
    return null;
  }
  const row = data as { copied?: boolean; new_count?: number } | null;
  return {
    copied: Boolean(row?.copied),
    new_count: Number(row?.new_count ?? 0),
  };
}
