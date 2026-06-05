import type { SupabaseClient } from "@supabase/supabase-js";

import { friendlyStorageMessage } from "@/lib/supabase/storage-error";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

import { extFromMime, validateImageFile, validateMediaMagicBytes, validateVideoFile } from "./validate-upload";

/** Web: `post-images` / `videos` + public URL. Edge `upload-validate`: `media` + signed URL — akış uyumsuz, bu fazda Edge çağrılmıyor (validate-upload.ts notu). */

function objectPath(userId: string, ext: string): string {
  return `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

export async function uploadToBucket(
  client: SupabaseClient,
  bucket: "post-images" | "videos" | "stories",
  userId: string,
  file: File,
): Promise<{ publicUrl: string; path: string }> {
  if (!isWebWriteEnabled()) {
    throw new Error(WEB_WRITE_BLOCKED_MESSAGE);
  }
  if (bucket === "post-images" || bucket === "stories") {
    const v = validateImageFile(file);
    if (v) throw new Error(v);
    const magic = await validateMediaMagicBytes(file, "image");
    if (magic) throw new Error(magic);
  } else {
    const v = validateVideoFile(file);
    if (v) throw new Error(v);
    const magic = await validateMediaMagicBytes(file, "video");
    if (magic) throw new Error(magic);
  }

  const ext = extFromMime(file.type);
  const path = objectPath(userId, ext);
  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
    cacheControl: bucket === "videos" ? "3600" : "7200",
  });
  if (error) {
    throw new Error(friendlyStorageMessage(error.message));
  }
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}
