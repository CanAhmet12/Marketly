import type { SupabaseClient } from "@supabase/supabase-js";

export type PostSeoRow = {
  title: string | null;
  content: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  media_urls: unknown;
  type: string | null;
};

/** Anon istemci ile tek satır; RLS engellerse null */
export async function fetchPostSeoRow(client: SupabaseClient, id: string): Promise<PostSeoRow | null> {
  const { data, error } = await client
    .from("posts")
    .select("title, content, thumbnail_url, image_url, media_urls, type")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.warn("[seo] fetchPostSeoRow", error.message);
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const r = data as Record<string, unknown>;
  return {
    title: r.title != null ? String(r.title) : null,
    content: r.content != null ? String(r.content) : null,
    thumbnail_url: r.thumbnail_url != null ? String(r.thumbnail_url) : null,
    image_url: r.image_url != null ? String(r.image_url) : null,
    media_urls: r.media_urls,
    type: r.type != null ? String(r.type) : null,
  };
}
