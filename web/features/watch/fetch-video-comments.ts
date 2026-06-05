import type { SupabaseClient } from "@supabase/supabase-js";

import { isMockDataEnabled } from "@/mock/config";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";
import { mockVideoCommentsFor } from "@/mock/fixtures/comments";

import type { ProfileJoin, WatchVideoComment } from "./types";

/** Mobil `useVideoComments` ile aynı tablo: `video_comments.video_id` = gönderi `id` */
export async function fetchVideoComments(
  client: SupabaseClient,
  videoPostId: string,
): Promise<WatchVideoComment[]> {
  if (isMockDataEnabled()) {
    return mockVideoCommentsFor(videoPostId);
  }

  try {
    const { data, error } = await client
      .from("video_comments")
      .select("id, video_id, user_id, content, likes, is_pinned, created_at")
      .eq("video_id", videoPostId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      if (error.code === "42P01") {
        console.warn("[watch] video_comments tablosu bulunamadı");
        return [];
      }
      throw error;
    }
    if (!data?.length) return [];

    const userIds = [...new Set(data.map((c) => c.user_id))];
    const { data: profData, error: pErr } = await client
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", userIds);

    if (pErr) {
      console.warn("[watch] profiles for comments", pErr.message);
    }

    const profMap: Record<string, ProfileJoin> = {};
    for (const p of profData ?? []) {
      profMap[(p as { id: string }).id] = p as ProfileJoin;
    }

    return data.map((c) => {
      const prof = profMap[c.user_id];
      return {
        id: c.id,
        video_id: c.video_id,
        user_id: c.user_id,
        content: c.content,
        likes: c.likes ?? 0,
        is_pinned: c.is_pinned ?? false,
        created_at: c.created_at,
        author_name: prof?.full_name ?? prof?.username ?? "Kullanıcı",
        author_avatar: prof?.avatar_url ?? null,
        author_handle: prof?.username ? `@${prof.username}` : "@kullanici",
      };
    });
  } catch (e) {
    console.warn("[watch] fetchVideoComments", e);
    return [];
  }
}

export async function insertVideoComment(
  client: SupabaseClient,
  videoPostId: string,
  userId: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  if (isMockDataEnabled()) {
    return { ok: false, error: "Mock modunda yorum kaydedilmez (tasarım önizlemesi)." };
  }
  if (!isWebWriteEnabled()) {
    return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  }
  try {
    const { error } = await client.from("video_comments").insert({
      video_id: videoPostId,
      user_id: userId,
      content: content.trim(),
    });
    if (error) {
      if (error.code === "42P01") return { ok: false, error: "Yorum tablosu kullanılamıyor." };
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Bilinmeyen hata" };
  }
}
