import type { PlaylistDetailPayload, PlaylistDiscoveryRow } from "../domain/types";

export type PlaylistRepository = {
  getPlaylistDetail(playlistId: string, viewerId: string | null, playingId?: string | null): PlaylistDetailPayload | null;
  getRecommendedPlaylists(viewerId: string | null, limit: number): PlaylistDiscoveryRow[];
  recordPlaylistView(playlistId: string, viewerId: string | null): void;
};
