import type { SupabaseClient } from "@supabase/supabase-js";

import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";
import { isMockDataEnabled } from "@/mock/config";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";
import { getSocialRepository } from "@/features/social/repository";
import { logClientError } from "@/lib/errors/client-error-log";

import type { PostCommentRow } from "./types";

function mapProfile(
  profiles: unknown,
): { full_name: string | null; username: string | null; avatar_url: string | null; tier: string | null } | null {
  if (!profiles) return null;
  const p = Array.isArray(profiles) ? profiles[0] : profiles;
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  return {
    full_name: o.full_name != null ? String(o.full_name) : null,
    username: o.username != null ? String(o.username) : null,
    avatar_url: o.avatar_url != null ? String(o.avatar_url) : null,
    tier: o.tier != null ? String(o.tier) : null,
  };
}

async function attachCommentLikes(
  client: SupabaseClient,
  userId: string | null,
  rows: PostCommentRow[],
  ids: string[],
): Promise<void> {
  if (!userId || ids.length === 0) return;
  try {
    const { data: likes } = await client.from("comment_likes").select("comment_id").eq("user_id", userId).in("comment_id", ids);
    const liked = new Set((likes ?? []).map((l: { comment_id: string }) => l.comment_id));
    for (const r of rows) {
      r.is_liked = liked.has(r.id);
    }
  } catch {
    /* tablo yoksa sessiz */
  }
}

/** Mobil `useCommentThread` + `useComments` ile uyumlu; nested alan yoksa düz liste */
export async function fetchPostComments(
  client: SupabaseClient,
  postId: string,
  userId: string | null,
): Promise<PostCommentRow[]> {
  if (isMockDataEnabled()) {
    return getSocialRepository().listPostComments(postId);
  }

  const tryFull = await client
    .from("comments")
    .select(
      `
      id, post_id, user_id, content, created_at, likes_count, likes,
      parent_comment_id, depth, is_pinned,
      profiles!comments_user_id_fkey ( full_name, username, avatar_url, tier )
    `,
    )
    .eq("post_id", postId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(150);

  let rowsRaw: Record<string, unknown>[] | null = tryFull.data as Record<string, unknown>[] | null;
  const err = tryFull.error;

  if (err?.code === "42P01") {
    logClientError("post:comments:table-missing", err);
    return [];
  }

  if (err) {
    const simple = await client
      .from("comments")
      .select("id, post_id, user_id, content, created_at, likes_count")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .limit(150);
    if (simple.error) {
      logClientError("post:fetchPostComments:simple", simple.error);
      return [];
    }
    rowsRaw = (simple.data ?? null) as Record<string, unknown>[] | null;
    const uids = [...new Set((rowsRaw ?? []).map((c) => String(c.user_id ?? "")))].filter(Boolean);
    const { data: profs } = await client.from("profiles").select("id, username, full_name, avatar_url, tier").in("id", uids);
    const pm: Record<string, Record<string, unknown>> = {};
    for (const p of profs ?? []) {
      const row = p as Record<string, unknown>;
      pm[String(row.id)] = row;
    }

    const mapped: PostCommentRow[] = (rowsRaw ?? []).map((c: Record<string, unknown>) => {
      const prof = pm[String(c.user_id)];
      return {
        id: String(c.id),
        post_id: String(c.post_id),
        user_id: String(c.user_id),
        content: String(c.content ?? ""),
        created_at: String(c.created_at ?? ""),
        likes: typeof c.likes_count === "number" ? c.likes_count : 0,
        parent_comment_id: null,
        depth: 0,
        is_pinned: false,
        author_name: prof?.full_name != null ? String(prof.full_name) : prof?.username != null ? String(prof.username) : "Kullanıcı",
        author_handle: `@${prof?.username != null ? String(prof.username) : "user"}`,
        author_avatar: prof?.avatar_url != null ? String(prof.avatar_url) : null,
        author_tier: prof?.tier != null ? String(prof.tier) : "free",
        is_liked: false,
      };
    });
    await attachCommentLikes(client, userId, mapped, mapped.map((m) => m.id));
    return mapped;
  }

  const mappedFull: PostCommentRow[] = (rowsRaw ?? []).map((c: Record<string, unknown>) => {
    const prof = mapProfile(c.profiles);
    const likesCount = typeof c.likes_count === "number" ? c.likes_count : typeof c.likes === "number" ? c.likes : 0;
    return {
      id: String(c.id),
      post_id: String(c.post_id),
      user_id: String(c.user_id),
      content: String(c.content ?? ""),
      created_at: String(c.created_at ?? ""),
      likes: likesCount,
      parent_comment_id: c.parent_comment_id != null ? String(c.parent_comment_id) : null,
      depth: typeof c.depth === "number" ? c.depth : 0,
      is_pinned: Boolean(c.is_pinned),
      author_name: prof?.full_name?.trim() || prof?.username || "Kullanıcı",
      author_handle: `@${prof?.username ?? "user"}`,
      author_avatar: prof?.avatar_url ?? null,
      author_tier: prof?.tier ?? "free",
      is_liked: false,
    };
  });

  await attachCommentLikes(client, userId, mappedFull, mappedFull.map((m) => m.id));
  return mappedFull;
}

export async function incrementPostCommentCount(client: SupabaseClient, postId: string): Promise<void> {
  if (isMockDataEnabled()) {
    return;
  }
  if (!isWebWriteEnabled()) {
    return;
  }
  try {
    const { error } = await client.rpc("increment_comments", { post_id: postId });
    if (!error) return;
  } catch {
    /* RPC yok */
  }
  try {
    const { data: postRow, error: selErr } = await client
      .from("posts")
      .select("comments, comments_count")
      .eq("id", postId)
      .maybeSingle();
    if (selErr || !postRow) return;
    const r = postRow as Record<string, unknown>;
    const cur =
      typeof r.comments === "number"
        ? r.comments
        : typeof r.comments_count === "number"
          ? r.comments_count
          : 0;
    const next = cur + 1;
    const patch: Record<string, number> = {};
    if (typeof r.comments === "number") patch.comments = next;
    if (typeof r.comments_count === "number") patch.comments_count = next;
    if (Object.keys(patch).length === 0) return;
    await client.from("posts").update(patch).eq("id", postId);
  } catch (e) {
    logClientError("post:incrementCommentCount", e);
  }
}

export type InsertCommentInput = {
  postId: string;
  userId: string;
  content: string;
  /** Yalnızca üst düzey yorum id — 1 seviye thread */
  parentCommentId: string | null;
};

export async function insertPostComment(client: SupabaseClient, input: InsertCommentInput): Promise<{ ok: boolean; error?: string }> {
  if (isMockDataEnabled()) {
    return { ok: false, error: "Mock modunda yorum kaydedilmez (tasarım önizlemesi)." };
  }
  if (!isWebWriteEnabled()) {
    return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  }

  const base = {
    post_id: input.postId,
    user_id: input.userId,
    content: input.content.trim(),
  };

  let ins = await client.from("comments").insert({
    ...base,
    ...(input.parentCommentId
      ? { parent_comment_id: input.parentCommentId, depth: 1 }
      : { depth: 0 }),
  });

  if (ins.error?.code === "42703" || (ins.error?.message && ins.error.message.includes("column"))) {
    if (input.parentCommentId) {
      ins = await client.from("comments").insert({
        ...base,
        parent_comment_id: input.parentCommentId,
      });
    }
    if (ins.error) {
      ins = await client.from("comments").insert(base);
    }
  } else if (ins.error && input.parentCommentId) {
    ins = await client.from("comments").insert({
      ...base,
      parent_comment_id: input.parentCommentId,
    });
  }

  if (ins.error) {
    return { ok: false, error: friendlyPostgrestMessage(ins.error) };
  }

  await incrementPostCommentCount(client, input.postId);
  return { ok: true };
}
