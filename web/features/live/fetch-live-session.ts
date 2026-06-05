import type { SupabaseClient } from "@supabase/supabase-js";

export type LiveSessionRow = {
  channel_name: string;
  is_active: boolean;
  viewer_count: number;
};

/** Aktif yayın oturumundan Agora kanal adı; yoksa null. */
export async function fetchLiveSessionChannel(
  client: SupabaseClient,
  postId: string,
): Promise<LiveSessionRow | null> {
  const { data, error } = await client
    .from("live_sessions")
    .select("channel_name, is_active, viewer_count")
    .eq("post_id", postId)
    .eq("is_active", true)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("[live] session fetch", error.message);
    return null;
  }
  if (!data?.channel_name?.trim()) return null;
  return data as LiveSessionRow;
}
