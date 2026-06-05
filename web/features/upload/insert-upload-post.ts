import type { SupabaseClient } from "@supabase/supabase-js";

import type { MediaItem } from "@/features/feed/types";
import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

export type UploadKind = "post" | "video" | "short";

export type InsertUploadPostArgs = {
  userId: string;
  kind: UploadKind;
  content: string;
  assetTag: string | null;
  title: string | null;
  mediaUrls?: MediaItem[] | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  durationSec?: number | null;
  quotedPostId?: string | null;
  replyToPostId?: string | null;
};

function buildPayload(a: InsertUploadPostArgs): Record<string, unknown> {
  const type = a.kind === "post" ? "post" : a.kind;
  const payload: Record<string, unknown> = {
    user_id: a.userId,
    content: a.content.trim(),
    type,
    asset_tag: a.assetTag?.trim() ? a.assetTag.trim().toUpperCase() : null,
  };
  if (a.title?.trim()) payload.title = a.title.trim();
  if (a.quotedPostId?.trim()) payload.quoted_post_id = a.quotedPostId.trim();
  if (a.replyToPostId?.trim()) payload.reply_to_post_id = a.replyToPostId.trim();

  if (a.kind === "post") {
    if (a.mediaUrls && a.mediaUrls.length > 0) payload.media_urls = a.mediaUrls;
    if (a.imageUrl) payload.image_url = a.imageUrl;
    return payload;
  }

  if (a.videoUrl) payload.video_url = a.videoUrl;
  if (a.thumbnailUrl) payload.thumbnail_url = a.thumbnailUrl;
  if (a.mediaUrls && a.mediaUrls.length > 0) {
    payload.media_urls = a.mediaUrls;
  } else if (a.videoUrl) {
    const item: MediaItem = {
      url: a.videoUrl,
      type: "video",
      thumbnail_url: a.thumbnailUrl ?? undefined,
      duration: a.durationSec != null ? Math.round(a.durationSec) : undefined,
    };
    payload.media_urls = [item];
  }
  return payload;
}

/** `posts` insert — mobil `usePosts.createPost` ile uyumlu alanlar */
export async function insertUploadPost(
  client: SupabaseClient,
  args: InsertUploadPostArgs,
): Promise<{ id: string } | { error: string }> {
  if (!isWebWriteEnabled()) {
    return { error: WEB_WRITE_BLOCKED_MESSAGE };
  }
  let payload = buildPayload(args);
  let { data, error } = await client.from("posts").insert(payload).select("id").single();

  if (error && "title" in payload) {
    const rest = { ...payload };
    delete rest.title;
    payload = rest;
    ({ data, error } = await client.from("posts").insert(payload).select("id").single());
  }

  if (error) {
    console.warn("[upload] insertUploadPost", error.message);
    return { error: friendlyPostgrestMessage(error) };
  }
  if (!data?.id) return { error: "Yanıt ID içermiyor" };
  return { id: String(data.id) };
}
