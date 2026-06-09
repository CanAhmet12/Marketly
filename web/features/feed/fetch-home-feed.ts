import type { SupabaseClient } from "@supabase/supabase-js";

import type { HomeFeedMode } from "@/features/home/repository/types";
import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";

import { readPostComments, readPostLikes } from "./post-count-fields";
import type { FeedPageResult, FeedPost } from "./types";

const PAGE_SIZE = 10;

const POST_FEED_SELECT = `
          id, user_id, content, asset_tag, image_url, type, video_url, thumbnail_url, title,
          likes, comments, likes_count, comments_count, views_count, created_at,
          media_urls, mentioned_users, link_preview, quoted_post_id, reply_to_post_id,
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
        `;

const POST_QUOTED_SELECT = `
            id, user_id, content, asset_tag, image_url, type, thumbnail_url, title,
            likes, comments, likes_count, comments_count, views_count, created_at,
            media_urls, link_preview,
            profiles!posts_user_id_fkey (
              id,
              username,
              full_name,
              avatar_url,
              tier
            )
          `;

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

function mapQuotedRow(qp: Record<string, unknown>): FeedPost {
  const prof = pickProfile({ profiles: qp.profiles });
  return {
    id: String(qp.id),
    user_id: String(qp.user_id),
    content: String(qp.content ?? ""),
    asset_tag: qp.asset_tag != null ? String(qp.asset_tag) : null,
    image_url: qp.image_url != null ? String(qp.image_url) : null,
    type: qp.type != null ? String(qp.type) : null,
    video_url: null,
    thumbnail_url: qp.thumbnail_url != null ? String(qp.thumbnail_url) : null,
    title: qp.title != null ? String(qp.title) : null,
    likes: readPostLikes(qp),
    comments: readPostComments(qp),
    views_count: typeof qp.views_count === "number" ? qp.views_count : null,
    created_at: String(qp.created_at ?? ""),
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
  row: Record<string, unknown>,
  userId: string | null,
  quotedMap: Record<string, FeedPost>,
  savedSet: Set<string> | null,
): FeedPost {
  const prof = pickProfile({ profiles: row.profiles });
  const postLikes = row.post_likes as { user_id: string } | { user_id: string }[] | null | undefined;
  const quotedId = row.quoted_post_id != null ? String(row.quoted_post_id) : null;
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
    likes: readPostLikes(row),
    comments: readPostComments(row),
    views_count: typeof row.views_count === "number" ? row.views_count : null,
    created_at: String(row.created_at ?? ""),
    author_name: prof?.full_name ?? "Kullanıcı",
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
    author_tier: prof?.tier ?? "free",
    is_liked: userId
      ? Boolean(
          Array.isArray(postLikes)
            ? postLikes.some((l) => l.user_id === userId)
            : postLikes && postLikes.user_id === userId,
        )
      : false,
    is_saved: Boolean(userId && savedSet?.has(String(row.id))),
    media_urls: (row.media_urls as FeedPost["media_urls"]) ?? null,
    mentioned_users: (row.mentioned_users as string[] | null) ?? null,
    link_preview: (row.link_preview as FeedPost["link_preview"]) ?? null,
    quoted_post_id: quotedId,
    quoted_post: quotedId && quotedMap[quotedId] ? quotedMap[quotedId] : null,
  };
}

/** Ana akışta yanıt gönderilerini gösterme — thread kökleri kalır */
function applyFeedStreamFilters<T extends { is: (col: string, val: null) => T }>(q: T): T {
  return q.is("reply_to_post_id", null);
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

  let q = client.from("posts").select(POST_FEED_SELECT);
  q = applyFeedStreamFilters(q);

  if (followingIds) {
    q = q.in("user_id", followingIds);
  }

  if (mode === "for_you" || mode === "following") {
    q = q.or("type.is.null,type.not.in.(video,short,live,signal)");
  }

  if (mode === "for_you") {
    q = q
      .order("likes", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  } else {
    q = q.order("created_at", { ascending: false });
  }

  q = q.range(from, to);

  let result = await q;
  let data = result.data as Record<string, unknown>[] | null;
  let error = result.error;

  if (error?.message?.includes("reply_to_post_id")) {
    const fallbackSelect = POST_FEED_SELECT.replace(/\s*reply_to_post_id,?\s*/g, "\n          ");
    let fallbackQ = client.from("posts").select(fallbackSelect);
    if (followingIds) fallbackQ = fallbackQ.in("user_id", followingIds);
    if (mode === "for_you" || mode === "following") {
      fallbackQ = fallbackQ.or("type.is.null,type.not.in.(video,short,live,signal)");
    }
    if (mode === "for_you") {
      fallbackQ = fallbackQ
        .order("likes", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
    } else {
      fallbackQ = fallbackQ.order("created_at", { ascending: false });
    }
    fallbackQ = fallbackQ.range(from, to);
    const retry = await fallbackQ;
    data = (retry.data ?? null) as Record<string, unknown>[] | null;
    error = retry.error;
  }
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
    .map((p) => (p.quoted_post_id != null ? String(p.quoted_post_id) : null))
    .filter((id): id is string => Boolean(id));

  let quotedMap: Record<string, FeedPost> = {};
  if (quotedIds.length > 0) {
    const { data: quotedPosts, error: qErr } = await client
      .from("posts")
      .select(POST_QUOTED_SELECT)
      .in("id", quotedIds);

    if (!qErr && quotedPosts?.length) {
      quotedMap = Object.fromEntries(
        quotedPosts.map((qp) => {
          const r = qp as Record<string, unknown>;
          return [String(r.id), mapQuotedRow(r)];
        }),
      );
    }
  }

  const posts = data.map((row) => mapMainRow(row, userId, quotedMap, savedSet));
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
    .select(POST_FEED_SELECT)
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
      .select(POST_QUOTED_SELECT)
      .in("id", quotedIds);

    if (!qErr && quotedPosts?.length) {
      quotedMap = Object.fromEntries(
        quotedPosts.map((qp) => {
          const r = qp as Record<string, unknown>;
          return [String(r.id), mapQuotedRow(r)];
        }),
      );
    }
  }

  const posts = data.map((row) => mapMainRow(row as Record<string, unknown>, userId, quotedMap, savedSet));
  return {
    posts,
    hasMore: data.length === PAGE_SIZE,
  };
}
