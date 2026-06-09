import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchStudioPlaylists } from "@/features/studio/fetch-studio";
import type { StudioPlaylistItem } from "@/features/studio/repository/types";
import { isMockDataEnabled } from "@/mock/config";
import { getStudioRepository } from "@/features/studio/repository";

/** Kanal oynatma listeleri — public studio listeleri */
export async function fetchChannelPlaylists(
  client: SupabaseClient,
  channelUserId: string,
): Promise<StudioPlaylistItem[]> {
  if (isMockDataEnabled()) {
    return getStudioRepository().getPlaylists(channelUserId);
  }

  const rows = await fetchStudioPlaylists(client, channelUserId);
  return rows.filter((pl) => pl.visibility === "public" || pl.visibility === "unlisted");
}
