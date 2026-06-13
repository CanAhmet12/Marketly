import { fetchCreatorsDirectory } from "@/features/creators/fetch-creators-directory";
import type { CreatorsSortId } from "@/features/creators/lib/creators-directory-config";
import type { CreatorDirectoryPayload } from "@/features/creators/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export class SupabaseCreatorsRepository {
  async getDirectory(userId: string | null, sort: CreatorsSortId = "recommended"): Promise<CreatorDirectoryPayload> {
    const client = getSupabaseBrowserClient();
    return fetchCreatorsDirectory(client, userId, sort);
  }
}

export type CreatorsRepository = {
  getDirectory(userId: string | null, sort?: CreatorsSortId): Promise<CreatorDirectoryPayload>;
};
