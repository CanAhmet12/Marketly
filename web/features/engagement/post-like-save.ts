import type { SupabaseClient } from "@supabase/supabase-js";

import { isMockDataEnabled } from "@/mock/config";
import { isWebWriteEnabled } from "@/lib/supabase/write-guard";
import { persistSavedPostToggle } from "@/features/social/lib/saved-posts-storage";

/** `post_likes` — feed, gönderi detayı ve watch ile aynı tablo/davranış */
export async function togglePostLike(
  client: SupabaseClient,
  userId: string,
  postId: string,
  currentlyLiked: boolean,
): Promise<void> {
  if (isMockDataEnabled()) {
    return;
  }
  if (!isWebWriteEnabled()) {
    return;
  }
  if (currentlyLiked) {
    const { error } = await client.from("post_likes").delete().eq("user_id", userId).eq("post_id", postId);
    if (error) throw error;
  } else {
    const { error } = await client.from("post_likes").insert({ user_id: userId, post_id: postId });
    if (error) throw error;
  }
}

/** `saved_posts` — kaydet / kaldır */
export async function toggleSavedPost(
  client: SupabaseClient,
  userId: string,
  postId: string,
  currentlySaved: boolean,
): Promise<void> {
  if (isMockDataEnabled()) {
    persistSavedPostToggle(postId, currentlySaved);
    return;
  }
  if (!isWebWriteEnabled()) {
    return;
  }
  if (currentlySaved) {
    const { error } = await client.from("saved_posts").delete().eq("user_id", userId).eq("post_id", postId);
    if (error) throw error;
  } else {
    const { error } = await client.from("saved_posts").insert({ user_id: userId, post_id: postId });
    if (error) throw error;
  }
}
