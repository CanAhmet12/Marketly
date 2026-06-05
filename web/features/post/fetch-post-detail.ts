import type { SupabaseClient } from "@supabase/supabase-js";

import type { FeedPost } from "@/features/feed/types";
import { isMockDataEnabled } from "@/mock/config";
import { mockPostDetail } from "@/mock/adapters/post";

import type { PostDetail } from "./types";

function pickProfile(profiles: unknown): {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  tier: string | null;
  verified: boolean | null;
} | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return (profiles[0] as ReturnType<typeof pickProfile>) ?? null;
  return profiles as ReturnType<typeof pickProfile>;
}

function parsePostLikes(raw: unknown, userId: string | null): boolean {
  if (!userId) return false;
  if (Array.isArray(raw)) return raw.some((l: { user_id?: string }) => l.user_id === userId);
  if (raw && typeof raw === "object" && "user_id" in (raw as object)) {
    return (raw as { user_id: string }).user_id === userId;
  }
  return false;
}

function mapRowToFeedPost(
  row: Record<string, unknown>,
  prof: ReturnType<typeof pickProfile>,
  is_liked: boolean,
  quoted: FeedPost | null,
  verified: boolean,
): PostDetail {
  const authorName = prof?.full_name?.trim() || prof?.username || "Kullanıcı";
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    content: String(row.content ?? ""),
    asset_tag: row.asset_tag != null ? String(row.asset_tag) : null,
    image_url: row.image_url != null ? String(row.image_url) : null,
    type: row.type != null ? String(row.type) : null,
    video_url: row.video_url != null ? String(row.video_url) : null,
    thumbnail_url: row.thumbnail_url != null ? String(row.thumbnail_url) : null,
    title: row.title != null ? String(row.title) : null,
    likes: typeof row.likes === "number" ? row.likes : 0,
    comments:
      typeof row.comments === "number"
        ? row.comments
        : typeof row.comments_count === "number"
          ? row.comments_count
          : 0,
    created_at: String(row.created_at ?? ""),
    author_name: authorName,
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
    author_tier: prof?.tier ?? "free",
    is_liked,
    media_urls: (row.media_urls as FeedPost["media_urls"]) ?? null,
    mentioned_users: (row.mentioned_users as string[] | null) ?? null,
    link_preview: (row.link_preview as FeedPost["link_preview"]) ?? null,
    quoted_post_id: row.quoted_post_id != null ? String(row.quoted_post_id) : null,
    quoted_post: quoted,
    verified,
    thread_id: row.thread_id != null ? String(row.thread_id) : null,
    reply_to_post_id: row.reply_to_post_id != null ? String(row.reply_to_post_id) : null,
    description: row.description != null ? String(row.description) : null,
    views_count: typeof row.views_count === "number" ? row.views_count : 0,
    is_saved: false,
  };
}

async function fetchQuotedPost(
  client: SupabaseClient,
  quotedId: string,
): Promise<FeedPost | null> {
  const { data: qData, error } = await client
    .from("posts")
    .select(
      `
      id, user_id, content, asset_tag, image_url, type, video_url, thumbnail_url, title,
      likes, comments, comments_count, views_count, created_at, media_urls, link_preview, quoted_post_id,
      profiles!posts_user_id_fkey ( username, full_name, avatar_url, tier )
    `,
    )
    .eq("id", quotedId)
    .maybeSingle();

  if (error || !qData) return null;

  const q = qData as Record<string, unknown>;
  const qp = pickProfile(q.profiles);
  const authorName = qp?.full_name?.trim() || qp?.username || "Kullanıcı";
  return {
    id: String(q.id),
    user_id: String(q.user_id),
    content: String(q.content ?? ""),
    asset_tag: q.asset_tag != null ? String(q.asset_tag) : null,
    image_url: q.image_url != null ? String(q.image_url) : null,
    type: q.type != null ? String(q.type) : null,
    video_url: q.video_url != null ? String(q.video_url) : null,
    thumbnail_url: q.thumbnail_url != null ? String(q.thumbnail_url) : null,
    title: q.title != null ? String(q.title) : null,
    likes: typeof q.likes === "number" ? q.likes : 0,
    comments:
      typeof q.comments === "number"
        ? q.comments
        : typeof q.comments_count === "number"
          ? q.comments_count
          : 0,
    views_count: typeof q.views_count === "number" ? q.views_count : null,
    created_at: String(q.created_at ?? ""),
    author_name: authorName,
    author_handle: `@${qp?.username ?? "user"}`,
    author_avatar: qp?.avatar_url ?? null,
    author_tier: qp?.tier ?? "free",
    is_liked: false,
    is_saved: false,
    media_urls: (q.media_urls as FeedPost["media_urls"]) ?? null,
    mentioned_users: null,
    link_preview: (q.link_preview as FeedPost["link_preview"]) ?? null,
    quoted_post_id: q.quoted_post_id != null ? String(q.quoted_post_id) : null,
    quoted_post: null,
  };
}

export async function fetchPostDetail(
  client: SupabaseClient,
  postId: string,
  userId: string | null,
): Promise<PostDetail | null> {
  if (isMockDataEnabled()) {
    return mockPostDetail(postId, userId);
  }

  const { data, error } = await client
    .from("posts")
    .select(
      `
      id, user_id, content, asset_tag, image_url, type, video_url, thumbnail_url, title,
      likes, comments, comments_count, created_at, media_urls, mentioned_users, link_preview, quoted_post_id,
      thread_id, reply_to_post_id, description, views_count,
      profiles!posts_user_id_fkey (
        id, username, full_name, avatar_url, tier, verified
      ),
      post_likes!left ( user_id )
    `,
    )
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    if (error.code === "42703" || error.message.includes("column")) {
      return fetchPostDetailNarrow(client, postId, userId);
    }
    console.warn("[post] fetchPostDetail", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const prof = pickProfile(row.profiles);
  const verified = Boolean(prof?.verified);

  let quoted: FeedPost | null = null;
  if (row.quoted_post_id) {
    quoted = await fetchQuotedPost(client, String(row.quoted_post_id));
  }

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

  const base = mapRowToFeedPost(row, prof, parsePostLikes(row.post_likes, userId), quoted, verified);
  return { ...base, is_saved };
}

/** Bazı projelerde `comments_count` / `thread_id` vb. yoksa */
async function fetchPostDetailNarrow(
  client: SupabaseClient,
  postId: string,
  userId: string | null,
): Promise<PostDetail | null> {
  const { data, error } = await client
    .from("posts")
    .select(
      `
      id, user_id, content, asset_tag, image_url, type, video_url, thumbnail_url, title,
      likes, comments, created_at, media_urls, mentioned_users, link_preview, quoted_post_id,
      profiles!posts_user_id_fkey (
        id, username, full_name, avatar_url, tier, verified
      ),
      post_likes!left ( user_id )
    `,
    )
    .eq("id", postId)
    .maybeSingle();

  if (error || !data) {
    console.warn("[post] fetchPostDetailNarrow", error?.message);
    return null;
  }

  const row = data as Record<string, unknown>;
  const prof = pickProfile(row.profiles);
  let quoted: FeedPost | null = null;
  if (row.quoted_post_id) {
    quoted = await fetchQuotedPost(client, String(row.quoted_post_id));
  }

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

  const base = mapRowToFeedPost(row, prof, parsePostLikes(row.post_likes, userId), quoted, Boolean(prof?.verified));
  return {
    ...base,
    thread_id: null,
    reply_to_post_id: null,
    description: null,
    views_count: 0,
    is_saved,
  };
}
