import type { SupabaseClient } from "@supabase/supabase-js";

import type { FeedPost } from "@/features/feed/types";
import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";

type ProfileJoin = {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  tier?: string | null;
};

function pickProfile(p: { profiles?: unknown }): ProfileJoin | null {
  const raw = p.profiles;
  if (!raw) return null;
  if (Array.isArray(raw)) return (raw[0] as ProfileJoin) ?? null;
  return raw as ProfileJoin;
}

function mapSavedRow(
  row: {
    id: string;
    user_id: string;
    content: string;
    asset_tag?: string | null;
    image_url?: string | null;
    type?: string | null;
    video_url?: string | null;
    thumbnail_url?: string | null;
    title?: string | null;
    likes?: number;
    comments?: number;
    views_count?: number | null;
    created_at: string;
    media_urls?: unknown;
    mentioned_users?: string[] | null;
    link_preview?: unknown;
    quoted_post_id?: string | null;
    profiles?: unknown;
    post_likes?: { user_id: string } | { user_id: string }[] | null;
  },
  userId: string,
): FeedPost {
  const prof = pickProfile({ profiles: row.profiles });
  return {
    id: row.id,
    user_id: row.user_id,
    content: row.content,
    asset_tag: row.asset_tag ?? null,
    image_url: row.image_url ?? null,
    type: row.type ?? null,
    video_url: row.video_url ?? null,
    thumbnail_url: row.thumbnail_url ?? null,
    title: row.title ?? null,
    likes: row.likes ?? 0,
    comments: row.comments ?? 0,
    views_count: row.views_count ?? null,
    created_at: row.created_at,
    author_name: prof?.full_name ?? "Kullanıcı",
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
    author_tier: prof?.tier ?? "free",
    is_liked: Boolean(
      Array.isArray(row.post_likes)
        ? row.post_likes.some((l) => l.user_id === userId)
        : row.post_likes && (row.post_likes as { user_id: string }).user_id === userId,
    ),
    is_saved: true,
    media_urls: (row.media_urls as FeedPost["media_urls"]) ?? null,
    mentioned_users: row.mentioned_users ?? null,
    link_preview: (row.link_preview as FeedPost["link_preview"]) ?? null,
    quoted_post_id: row.quoted_post_id ?? null,
    quoted_post: null,
  };
}

const POST_SELECT = `
  id, user_id, content, asset_tag, image_url, type, video_url, thumbnail_url, title,
  likes, comments, views_count, created_at, media_urls, mentioned_users, link_preview, quoted_post_id,
  profiles!posts_user_id_fkey ( id, username, full_name, avatar_url, tier ),
  post_likes!left ( user_id )
`;

/** Kullanıcının kaydettiği gönderiler — `saved_posts` → `posts` */
export async function fetchSavedPosts(client: SupabaseClient, userId: string): Promise<FeedPost[]> {
  const { data: savedRows, error: savedErr } = await client
    .from("saved_posts")
    .select("post_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (savedErr) throw new Error(friendlyPostgrestMessage(savedErr));
  if (!savedRows?.length) return [];

  const order = savedRows.map((r: { post_id: string }) => String(r.post_id));
  const { data: posts, error: postsErr } = await client.from("posts").select(POST_SELECT).in("id", order);

  if (postsErr) throw new Error(friendlyPostgrestMessage(postsErr));
  if (!posts?.length) return [];

  const byId = new Map(
    (posts as Parameters<typeof mapSavedRow>[0][]).map((row) => [row.id, mapSavedRow(row, userId)]),
  );

  return order.map((id) => byId.get(id)).filter((p): p is FeedPost => p != null);
}
