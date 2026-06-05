import type { SupabaseClient } from "@supabase/supabase-js";

/** `watchlists` tablosundan kullanıcının izleme listesini çek */
export async function fetchWatchlistFromDb(
  client: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data, error } = await client
    .from("watchlists")
    .select("asset_id")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((r: any) => String(r.asset_id).toUpperCase());
}

/** Sembol ekle */
export async function addToWatchlistDb(
  client: SupabaseClient,
  userId: string,
  symbol: string,
): Promise<void> {
  await client
    .from("watchlists")
    .insert({ user_id: userId, asset_id: symbol.trim().toUpperCase() });
}

/** Sembol çıkar */
export async function removeFromWatchlistDb(
  client: SupabaseClient,
  userId: string,
  symbol: string,
): Promise<void> {
  await client
    .from("watchlists")
    .delete()
    .eq("user_id", userId)
    .eq("asset_id", symbol.trim().toUpperCase());
}
