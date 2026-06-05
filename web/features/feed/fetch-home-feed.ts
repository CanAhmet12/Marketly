import type { SupabaseClient } from "@supabase/supabase-js";

import type { HomeFeedMode } from "@/features/home/repository/types";
import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";

import type { FeedPageResult, FeedPost } from "./types";

const PAGE_SIZE = 10;

export type HomeFeedFetchMode = HomeFeedMode;

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

function mapQuotedRow(qp: {
  id: string;
  user_id: string;
  content: string;
  asset_tag?: string | null;
  image_url?: string | null;
  type?: string | null;
  thumbnail_url?: string | null;
  title?: string | null;
  likes?: number;
  comments?: number;
  views_count?: number | null;
  created_at: string;
  media_urls?: unknown;
  link_preview?: unknown;
  profiles?: unknown;
}): FeedPost {
  const prof = pickProfile({ profiles: qp.profiles });
  return {
    id: qp.id,
    user_id: qp.user_id,
    content: qp.content,
    asset_tag: qp.asset_tag ?? null,
    image_url: qp.image_url ?? null,
    type: qp.type ?? null,
    video_url: null,
    thumbnail_url: qp.thumbnail_url ?? null,
    title: qp.title ?? null,
    likes: qp.likes ?? 0,
    comments: qp.comments ?? 0,
    views_count: qp.views_count ?? null,
    created_at: qp.created_at,
    author_name: prof?.full_name ?? "Kullanıcı",
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
    author_tier: prof?.tier ?? "free",
    is_liked: false,
    is_saved: false,
    media_urls: (qp.media_urls as FeedPost["media_urls"]) ?? null,
    mentioned_users: null,
    link_preview: (qp.link_preview as FeedPost["link_preview"]) ?? null,
    quoted_post_id: null,
    quoted_post: null,
  };
}

function mapMainRow(
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
  userId: string | null,
  quotedMap: Record<string, FeedPost>,
  savedSet: Set<string> | null,
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
    is_liked: userId
      ? Boolean(
          Array.isArray(row.post_likes)
            ? row.post_likes.some((l) => l.user_id === userId)
            : row.post_likes && (row.post_likes as { user_id: string }).user_id === userId,
        )
      : false,
    is_saved: Boolean(userId && savedSet?.has(row.id)),
    media_urls: (row.media_urls as FeedPost["media_urls"]) ?? null,
    mentioned_users: row.mentioned_users ?? null,
    link_preview: (row.link_preview as FeedPost["link_preview"]) ?? null,
    quoted_post_id: row.quoted_post_id ?? null,
    quoted_post:
      row.quoted_post_id && quotedMap[row.quoted_post_id] ? quotedMap[row.quoted_post_id] : null,
  };
}

/**
 * Mobil `usePosts`: `feedMode=all` → for_you; `feedMode=following` → takip edilen creator gönderileri.
 */
export async function fetchHomeFeedPage(
  client: SupabaseClient,
  pageIndex: number,
  userId: string | null,
  mode: HomeFeedFetchMode = "for_you",
): Promise<FeedPageResult> {
  const from = pageIndex * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let followingIds: string[] | null = null;
  if (mode === "following") {
    if (!userId) {
      return { posts: [], hasMore: false };
    }
    const { data: fd, error: fe } = await client.from("follows").select("following_id").eq("follower_id", userId);
    if (fe) {
      throw new Error(friendlyPostgrestMessage(fe));
    }
    followingIds = (fd ?? []).map((x: { following_id: string }) => x.following_id);
    if (followingIds.length === 0) {
      return { posts: [], hasMore: false };
    }
  }

  let q = client
    .from("posts")
    .select(
      `
          id, user_id, content, asset_tag, image_url, type, video_url, thumbnail_url, title, likes, comments, views_count, created_at,
          media_urls, mentioned_users, link_preview, quoted_post_id,
          profiles!posts_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            tier
          ),
          post_likes!left (
            user_id
          )
        `,
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (followingIds) {
    q = q.in("user_id", followingIds);
  }

  if (mode === "for_you" || mode === "following") {
    q = q.or("type.is.null,type.not.in.(video,short,live,signal)");
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(friendlyPostgrestMessage(error));
  }

  if (!data?.length) {
    return { posts: [], hasMore: false };
  }

  let savedSet: Set<string> | null = null;
  if (userId) {
    const ids = (data as { id: string }[]).map((p) => p.id);
    try {
      const { data: sav, error: savErr } = await client.from("saved_posts").select("post_id").eq("user_id", userId).in("post_id", ids);
      if (savErr) {
        console.warn("[feed] saved_posts batch", savErr.message);
        savedSet = new Set();
      } else {
        savedSet = new Set((sav ?? []).map((s: { post_id: string }) => String(s.post_id)));
      }
    } catch (e) {
      console.warn("[feed] saved_posts batch", e);
      savedSet = new Set();
    }
  }

  const quotedIds = data
    .filter((p: { quoted_post_id?: string | null }) => p.quoted_post_id)
    .map((p: { quoted_post_id: string }) => p.quoted_post_id);

  let quotedMap: Record<string, FeedPost> = {};
  if (quotedIds.length > 0) {
    const { data: quotedPosts, error: qErr } = await client
      .from("posts")
      .select(
        `
            id, user_id, content, asset_tag, image_url, type, thumbnail_url, title, likes, comments, views_count, created_at, media_urls, link_preview,
            profiles!posts_user_id_fkey (
              id,
              username,
              full_name,
              avatar_url,
              tier
            )
          `,
      )
      .in("id", quotedIds);

    if (!qErr && quotedPosts?.length) {
      quotedMap = Object.fromEntries(
        quotedPosts.map((qp) => {
          const r = qp as Parameters<typeof mapQuotedRow>[0];
          return [r.id, mapQuotedRow(r)];
        }),
      );
    }
  }

  const posts = data.map((row) =>
    mapMainRow(row as Parameters<typeof mapMainRow>[0], userId, quotedMap, savedSet),
  );
  return {
    posts,
    hasMore: data.length === PAGE_SIZE,
  };
}

/**
 * Keşfet — trend / keşif sıralaması (beğeni + yorum ağırlığı; tam skor RPC ile değiştirilebilir).
 */
export async function fetchDiscoverFeedPage(
  client: SupabaseClient,
  pageIndex: number,
  userId: string | null,
): Promise<FeedPageResult> {
  const from = pageIndex * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await client
    .from("posts")
    .select(
      `
          id, user_id, content, asset_tag, image_url, type, video_url, thumbnail_url, title, likes, comments, views_count, created_at,
          media_urls, mentioned_users, link_preview, quoted_post_id,
          profiles!posts_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            tier
          ),
          post_likes!left (
            user_id
          )
        `,
    )
    .order("likes", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(friendlyPostgrestMessage(error));
  }

  if (!data?.length) {
    return { posts: [], hasMore: false };
  }

  let savedSet: Set<string> | null = null;
  if (userId) {
    const ids = (data as { id: string }[]).map((p) => p.id);
    try {
      const { data: sav, error: savErr } = await client.from("saved_posts").select("post_id").eq("user_id", userId).in("post_id", ids);
      if (savErr) {
        console.warn("[discover-feed] saved_posts batch", savErr.message);
        savedSet = new Set();
      } else {
        savedSet = new Set((sav ?? []).map((s: { post_id: string }) => String(s.post_id)));
      }
    } catch (e) {
      console.warn("[discover-feed] saved_posts batch", e);
      savedSet = new Set();
    }
  }

  const quotedIds = data
    .filter((p: { quoted_post_id?: string | null }) => p.quoted_post_id)
    .map((p: { quoted_post_id: string }) => p.quoted_post_id);

  let quotedMap: Record<string, FeedPost> = {};
  if (quotedIds.length > 0) {
    const { data: quotedPosts, error: qErr } = await client
      .from("posts")
      .select(
        `
            id, user_id, content, asset_tag, image_url, type, thumbnail_url, title, likes, comments, views_count, created_at, media_urls, link_preview,
            profiles!posts_user_id_fkey (
              id,
              username,
              full_name,
              avatar_url,
              tier
            )
          `,
      )
      .in("id", quotedIds);

    if (!qErr && quotedPosts?.length) {
      quotedMap = Object.fromEntries(
        quotedPosts.map((qp) => {
          const r = qp as Parameters<typeof mapQuotedRow>[0];
          return [r.id, mapQuotedRow(r)];
        }),
      );
    }
  }

  const posts = data.map((row) =>
    mapMainRow(row as Parameters<typeof mapMainRow>[0], userId, quotedMap, savedSet),
  );
  return {
    posts,
    hasMore: data.length === PAGE_SIZE,
  };
}
