import type { SupabaseClient } from "@supabase/supabase-js";

import { friendlyStorageMessage } from "@/lib/supabase/storage-error";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";
import { extFromMime, validateImageFile, validateMediaMagicBytes } from "@/features/upload/validate-upload";

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export function validateAvatarFile(file: File): string | null {
  const base = validateImageFile(file);
  if (base) return base;
  if (file.size > AVATAR_MAX_BYTES) return "Avatar en fazla 5 MB olabilir.";
  return null;
}

export async function uploadAvatar(
  client: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  if (!isWebWriteEnabled()) {
    throw new Error(WEB_WRITE_BLOCKED_MESSAGE);
  }

  const validation = validateAvatarFile(file);
  if (validation) throw new Error(validation);

  const magic = await validateMediaMagicBytes(file, "image");
  if (magic) throw new Error(magic);

  const ext = extFromMime(file.type);
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await client.storage.from("avatars").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
    cacheControl: "7200",
  });

  if (error) {
    throw new Error(friendlyStorageMessage(error.message));
  }

  const { data } = client.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
