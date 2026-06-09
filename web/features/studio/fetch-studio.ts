import type { SupabaseClient } from "@supabase/supabase-js";

import {
  studioContentHref,
  studioContentKindLabel,
} from "@/features/studio/lib/studio-content-href";
import type {
  CreatorContentItem,
  StudioDraftItem,
  StudioScheduledItem,
  StudioPlaylistItem,
} from "@/features/studio/repository/types";

/** `posts` → CreatorContentItem[] */
export async function fetchStudioContent(
  client: SupabaseClient,
  ownerId: string,
): Promise<CreatorContentItem[]> {
  const { data, error } = await client
    .from("posts")
    .select("id, type, content, title, video_url, thumbnail_url, views_count, comments, likes, created_at, image_url")
    .eq("user_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((p: Record<string, unknown>): CreatorContentItem => {
    const id = String(p.id);
    const type = String(p.type ?? "post");
    return {
      id,
      kind: studioContentKindLabel(type) as CreatorContentItem["kind"],
      title: String(
        (p.title ?? (typeof p.content === "string" ? p.content.slice(0, 60) : "")) || "İsimsiz",
      ),
      preview: typeof p.content === "string" ? p.content : "",
      thumbnailUrl:
        (typeof p.thumbnail_url === "string" ? p.thumbnail_url : null) ??
        (typeof p.image_url === "string" ? p.image_url : null),
      status: "published",
      views: typeof p.views_count === "number" ? p.views_count : 0,
      comments: typeof p.comments === "number" ? p.comments : 0,
      likes: typeof p.likes === "number" ? p.likes : 0,
      publishedAt: typeof p.created_at === "string" ? p.created_at : null,
      visibility: "public",
      href: studioContentHref(type, id),
    };
  });
}

/** `post_drafts` → StudioDraftItem[] */
export async function fetchStudioDrafts(
  client: SupabaseClient,
  ownerId: string,
): Promise<StudioDraftItem[]> {
  const { data, error } = await client
    .from("post_drafts")
    .select("id, type, content, title, thumbnail_url, updated_at, created_at")
    .eq("user_id", ownerId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((d: any): StudioDraftItem => ({
    id:           String(d.id),
    kind:         d.type === "video" ? "video" : d.type === "signal" ? "signal" : "post",
    title:        d.title ?? d.content?.slice(0, 60) ?? "Taslak",
    preview:      d.content ?? "",
    lastEditedAt: d.updated_at ?? d.created_at,
    thumbnailUrl: d.thumbnail_url ?? null,
  }));
}

/** `scheduled_posts` → StudioScheduledItem[] */
export async function fetchStudioScheduled(
  client: SupabaseClient,
  ownerId: string,
): Promise<StudioScheduledItem[]> {
  const { data, error } = await client
    .from("scheduled_posts")
    .select("id, content, title, type, scheduled_at, status")
    .eq("user_id", ownerId)
    .order("scheduled_at", { ascending: true })
    .limit(50);

  if (error || !data) return [];

  return data.map((s: any): StudioScheduledItem => ({
    id:             String(s.id),
    contentKind:    s.type === "video" ? "video" : s.type === "short" ? "short" : s.type === "signal" ? "signal" : "post",
    title:          s.title ?? s.content?.slice(0, 60) ?? "Zamanlı içerik",
    preview:        s.content ?? "",
    scheduledFor:   s.scheduled_at,
    status:         (s.status === "pending" ? "pending" : s.status === "failed" ? "cancelled" : "pending") as StudioScheduledItem["status"],
    platformTarget: "all",
    thumbnailUrl:   null,
  } as StudioScheduledItem));
}

/** `playlists` → StudioPlaylistItem[] */
export async function fetchStudioPlaylists(
  client: SupabaseClient,
  ownerId: string,
): Promise<StudioPlaylistItem[]> {
  const { data, error } = await client
    .from("playlists")
    .select("id, title, description, updated_at, created_at")
    .eq("user_id", ownerId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((pl: any): StudioPlaylistItem => ({
    id:                 String(pl.id),
    title:              pl.title ?? "Playlist",
    description:        pl.description ?? "",
    videoCount:         0,
    visibility:         "public",
    updatedAt:          pl.updated_at ?? pl.created_at,
    coverThumbnailUrl:  null,
    ownerId:            ownerId,
    videoIds:           [],
    watchTimeSeconds:   0,
    totalViews:         0,
    followerCount:      0,
    memberPostIds: [],
  } as unknown as StudioPlaylistItem));
}
