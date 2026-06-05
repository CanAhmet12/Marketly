"use client";

import { useQuery } from "@tanstack/react-query";

import type { PlaylistDetailPayload } from "@/features/playlists/domain/types";
import { fetchPlaylistDetail } from "@/features/playlists/fetch-playlist-detail";
import { buildPlaylistDetailFromLive } from "@/features/playlists/lib/build-playlist-detail-from-live";
import { getPlaylistRepository } from "@/features/playlists/repository";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function usePlaylistDetail(
  playlistId: string,
  viewerId: string | null,
  playingId?: string | null,
): { detail: PlaylistDetailPayload | null; isLoading: boolean; mockOn: boolean } {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured() && Boolean(playlistId.trim());

  const liveQuery = useQuery({
    queryKey: queryKeys.playlistDetail(playlistId, viewerId),
    queryFn: async () => {
      const raw = await fetchPlaylistDetail(getSupabaseBrowserClient(), playlistId);
      if (!raw) return null;
      return buildPlaylistDetailFromLive(raw, viewerId, playingId ?? null);
    },
    enabled: liveMode,
    staleTime: 60_000,
  });

  if (mockOn) {
    const detail = getPlaylistRepository().getPlaylistDetail(playlistId, viewerId, playingId ?? null);
    return { detail, isLoading: false, mockOn: true };
  }

  return {
    detail: liveQuery.data ?? null,
    isLoading: liveQuery.isLoading,
    mockOn: false,
  };
}
