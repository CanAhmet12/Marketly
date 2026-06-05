import type { CreatorDirectoryPayload } from "@/features/creators/types";
import { CREATOR_ASSET_PRESETS } from "@/features/creators/creators-filters";
import type { CreatorsRepository } from "@/features/creators/repository/creators-repository";

/** Prod: `useCreatorsDirectory` → `fetchCreatorsDirectory` (get_creators_directory RPC). */
export class SupabaseCreatorsRepository implements CreatorsRepository {
  getDirectoryPayload(_viewerId: string | null): CreatorDirectoryPayload {
    return {
      creators: [],
      featuredIds: [],
      liveNowIds: [],
      assetPresets: CREATOR_ASSET_PRESETS,
    };
  }
}
