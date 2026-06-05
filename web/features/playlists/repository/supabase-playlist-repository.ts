import type { PlaylistDetailPayload, PlaylistDiscoveryRow } from "../domain/types";
import type { PlaylistRepository } from "./playlist-repository";

export class SupabasePlaylistRepository implements PlaylistRepository {
  getPlaylistDetail(): PlaylistDetailPayload | null {
    return null;
  }

  getRecommendedPlaylists(): PlaylistDiscoveryRow[] {
    return [];
  }

  recordPlaylistView(): void {
    /* TODO: edge ingest */
  }
}
