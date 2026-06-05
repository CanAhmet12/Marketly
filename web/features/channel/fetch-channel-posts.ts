import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChannelPost } from "./types";
import { isMockDataEnabled } from "@/mock/config";
import { mockChannelPosts } from "@/mock/adapters/channel";
import { logClientError } from "@/lib/errors/client-error-log";

export async function fetchChannelPosts(
  client: SupabaseClient,
  userId: string,
  limit = 100,
): Promise<ChannelPost[]> {
  if (isMockDataEnabled()) {
    return mockChannelPosts(userId);
  }

  const { data, error } = await client
    .from("posts")
    .select(
      `
      id, user_id, content, type, video_url, thumbnail_url, image_url, title,
      likes, comments, created_at, asset_tag, media_urls
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logClientError("channel:fetchChannelPosts", error);
    return [];
  }

  return (data ?? []) as ChannelPost[];
}
