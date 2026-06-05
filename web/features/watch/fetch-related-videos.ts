import type { SupabaseClient } from "@supabase/supabase-js";

import { isMockDataEnabled } from "@/mock/config";
import { mockRelatedVideos } from "@/mock/adapters/watch";

import type { ProfileJoin, RelatedVideo } from "./types";

function pickProfile(profiles: unknown): ProfileJoin | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return (profiles[0] as ProfileJoin) ?? null;
  return profiles as ProfileJoin;
}

type RawRow = {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  video_url: string | null;
  type: string | null;
  created_at: string;
  profiles?: unknown;
};

function toRelated(r: RawRow): RelatedVideo {
  const prof = pickProfile(r.profiles);
  return {
    id: r.id,
    creator_id: r.user_id,
    title: r.title,
    content: r.content,
    thumbnail_url: r.thumbnail_url,
    image_url: r.image_url,
    video_url: r.video_url,
    type: r.type,
    created_at: r.created_at,
    creator_name: prof?.full_name ?? prof?.username ?? "Kullanıcı",
    creator_handle: `@${prof?.username ?? "user"}`,
  };
}

/** Son video/short/live içerikleri; watch-next önceliği mock’ta adapter’da */
export async function fetchRelatedVideos(
  client: SupabaseClient,
  excludeId: string,
  preferUserId?: string | null,
  opts?: {
    playlistId?: string | null;
    currentAssetTag?: string | null;
    currentType?: string | null;
    viewerId?: string | null;
  },
): Promise<RelatedVideo[]> {
  if (isMockDataEnabled()) {
    return mockRelatedVideos(excludeId, preferUserId, opts);
  }

  void opts;

  const types = ["video", "short", "live"];

  const { data, error } = await client
    .from("posts")
    .select(
      `
      id, user_id, title, content, thumbnail_url, image_url, video_url, type, created_at,
      profiles!posts_user_id_fkey ( username, full_name )
    `,
    )
    .in("type", types)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    console.warn("[watch] fetchRelatedVideos", error.message);
    return [];
  }

  const rows = (data ?? []) as RawRow[];
  const sorted = [...rows].sort((a, b) => {
    if (preferUserId) {
      const ap = a.user_id === preferUserId ? 0 : 1;
      const bp = b.user_id === preferUserId ? 0 : 1;
      if (ap !== bp) return ap - bp;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return sorted.slice(0, 10).map(toRelated);
}
