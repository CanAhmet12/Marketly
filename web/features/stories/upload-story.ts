import type { SupabaseClient } from "@supabase/supabase-js";

import { uploadToBucket } from "@/features/upload/storage-upload";
import { validateImageFile } from "@/features/upload/validate-upload";
import { isMockDataEnabled } from "@/mock/config";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";
import { pushMockUploadedStory } from "@/mock/adapters/story-upload-store";

const STORY_MAX_BYTES = 5 * 1024 * 1024;

export function validateStoryImage(file: File): string | null {
  const base = validateImageFile(file);
  if (base) return base;
  if (file.size > STORY_MAX_BYTES) return "Hikâye görseli en fazla 5 MB olabilir.";
  return null;
}

export async function uploadStoryImage(
  client: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ publicUrl: string }> {
  const err = validateStoryImage(file);
  if (err) throw new Error(err);
  const { publicUrl } = await uploadToBucket(client, "stories", userId, file);
  return { publicUrl };
}

export async function insertStoryRow(
  client: SupabaseClient,
  userId: string,
  imageUrl: string,
): Promise<{ id: string } | { error: string }> {
  if (isMockDataEnabled()) {
    return { id: `mock-story-${Date.now()}` };
  }
  if (!isWebWriteEnabled()) {
    return { error: WEB_WRITE_BLOCKED_MESSAGE };
  }
  const { data, error } = await client
    .from("stories")
    .insert({ user_id: userId, image_url: imageUrl })
    .select("id")
    .single();
  if (error) return { error: error.message };
  if (!data?.id) return { error: "Hikâye kaydedilemedi" };
  return { id: String(data.id) };
}
