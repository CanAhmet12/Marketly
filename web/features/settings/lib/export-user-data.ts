import { fetchSavedPosts } from "@/features/social/fetch-saved-posts";
import { fetchWatchlistFromDb } from "@/features/markets/fetch-watchlist";
import type { SettingsBundle } from "@/features/social/repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type UserDataExport = {
  exported_at: string;
  user_id: string;
  profile: Record<string, unknown> | null;
  settings: SettingsBundle;
  posts: unknown[];
  signals: unknown[];
  saved_posts: unknown[];
  watchlist: unknown[];
  follows_following: unknown[];
  follows_followers: unknown[];
};

export async function exportUserData(userId: string, settings: SettingsBundle): Promise<UserDataExport> {
  const client = getSupabaseBrowserClient();

  const [profileRes, postsRes, signalsRes, savedPosts, watchlist, followingRes, followersRes] =
    await Promise.all([
      client.from("profiles").select("*").eq("id", userId).maybeSingle(),
      client.from("posts").select("id, content, created_at, asset_tag, media_urls").eq("user_id", userId).limit(500),
      client.from("signals").select("id, asset, direction, created_at, thesis").eq("creator_id", userId).limit(200),
      fetchSavedPosts(client, userId),
      fetchWatchlistFromDb(client, userId),
      client.from("follows").select("following_id, created_at").eq("follower_id", userId).limit(500),
      client.from("follows").select("follower_id, created_at").eq("following_id", userId).limit(500),
    ]);

  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile: (profileRes.data as Record<string, unknown> | null) ?? null,
    settings,
    posts: postsRes.data ?? [],
    signals: signalsRes.data ?? [],
    saved_posts: savedPosts,
    watchlist,
    follows_following: followingRes.data ?? [],
    follows_followers: followersRes.data ?? [],
  };
}

export function downloadJsonExport(payload: UserDataExport, filename?: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `marketly-export-${payload.user_id.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
