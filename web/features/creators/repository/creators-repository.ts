import type { CreatorDirectoryPayload } from "@/features/creators/types";

export interface CreatorsRepository {
  getDirectoryPayload(viewerId: string | null): CreatorDirectoryPayload;
}
