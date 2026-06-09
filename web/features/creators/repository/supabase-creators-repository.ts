import { fetchCreatorsDirectory } from "@/features/creators/fetch-creators-directory";
import type { CreatorDirectoryPayload } from "@/features/creators/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export class SupabaseCreatorsRepository {
  async getDirectory(userId: string | null): Promise<CreatorDirectoryPayload> {
    const client = getSupabaseBrowserClient();
    return fetchCreatorsDirectory(client, userId);
  }
}

export type CreatorsRepository = {
  getDirectory(userId: string | null): Promise<CreatorDirectoryPayload>;
};
