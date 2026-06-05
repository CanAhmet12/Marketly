import type { SupabaseClient } from "@supabase/supabase-js";

import { isMockDataEnabled } from "@/mock/config";
import { mockWatchPostDetail } from "@/mock/adapters/watch";

import type { ProfileJoin, WatchPostDetail } from "./types";

function pickProfile(profiles: unknown): ProfileJoin | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return (profiles[0] as ProfileJoin) ?? null;
  return profiles as ProfileJoin;
}

function parsePostLikes(raw: unknown, userId: string | null): boolean {
  if (!userId) return false;
  if (Array.isArray(raw)) return raw.some((l: { user_id?: string }) => l.user_id === userId);
  if (raw && typeof raw === "object" && "user_id" in (raw as object)) {
    return (raw as { user_id: string }).user_id === userId;
  }
  return false;
}

export async function fetchWatchPost(
  client: SupabaseClient,
  postId: string,
  userId: string | null,
): Promise<WatchPostDetail | null> {
  if (isMockDataEnabled()) {
    return mockWatchPostDetail(postId, userId);
  }

  const { data, error } = await client
    .from("posts")
    .select(
      `
      id, user_id, content, type, video_url, thumbnail_url, image_url, title, description,
      likes, comments, views_count, shares_count, created_at, duration, asset_tag, media_urls,
      profiles!posts_user_id_fkey (
        id, username, full_name, avatar_url, tier
      ),
      post_likes!left ( user_id )
    `,
    )
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    console.warn("[watch] fetchWatchPost", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as {
    id: string;
    user_id: string;
    content: string;
    type?: string | null;
    video_url?: string | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
    title?: string | null;
    description?: string | null;
    likes?: number;
    comments?: number;
    views_count?: number;
    shares_count?: number;
    created_at: string;
    duration?: number | null;
    asset_tag?: string | null;
    media_urls?: unknown;
    profiles?: unknown;
    post_likes?: unknown;
  };

  const prof = pickProfile(row.profiles);
  let is_saved = false;
  if (userId) {
    const { data: sav } = await client
      .from("saved_posts")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
    is_saved = Boolean(sav);
  }

  return {
    id: row.id,
    user_id: row.user_id,
    content: row.content ?? "",
    type: row.type ?? null,
    video_url: row.video_url ?? null,
    thumbnail_url: row.thumbnail_url ?? null,
    image_url: row.image_url ?? null,
    title: row.title ?? null,
    description: row.description ?? null,
    likes: row.likes ?? 0,
    comments: row.comments ?? 0,
    views_count: row.views_count ?? 0,
    shares_count: row.shares_count ?? 0,
    created_at: row.created_at,
    duration: row.duration ?? null,
    asset_tag: row.asset_tag ?? null,
    media_urls: row.media_urls ?? null,
    author_name: prof?.full_name ?? prof?.username ?? "Kullanıcı",
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
    author_tier: prof?.tier ?? "free",
    is_liked: parsePostLikes(row.post_likes, userId),
    is_saved,
  };
}
