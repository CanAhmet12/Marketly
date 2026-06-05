import { isMockDataEnabled } from "@/mock/config";

import type { PlaylistRepository } from "./playlist-repository";
import { MockPlaylistRepository } from "./mock-playlist-repository";
import { SupabasePlaylistRepository } from "./supabase-playlist-repository";

export type { PlaylistRepository } from "./playlist-repository";

let mockSingleton: MockPlaylistRepository | null = null;
let supabaseSingleton: SupabasePlaylistRepository | null = null;

export function getPlaylistRepository(): PlaylistRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockPlaylistRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabasePlaylistRepository();
  return supabaseSingleton;
}
