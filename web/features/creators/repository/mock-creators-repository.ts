import { buildCreatorsDirectoryPayload } from "@/features/creators/lib/build-creators-directory-payload";
import {
  enrichCreatorFromPosts,
  mapMockProfileToDirectoryRow,
} from "@/features/creators/lib/map-creator-directory-row";
import type { CreatorsSortId } from "@/features/creators/lib/creators-directory-config";
import type { CreatorDirectoryPayload } from "@/features/creators/types";
import { mockDiscoverFeedPage } from "@/mock/adapters/feed";
import { MOCK_PROFILES } from "@/mock/fixtures/profiles";

export class MockCreatorsRepository {
  async getDirectory(_userId: string | null, _sort: CreatorsSortId = "recommended"): Promise<CreatorDirectoryPayload> {
    void _userId;
    void _sort;
    const posts = mockDiscoverFeedPage(0, null).posts;
    const rows = MOCK_PROFILES.map((p) => {
      const enrich = enrichCreatorFromPosts(p.id, posts);
      return mapMockProfileToDirectoryRow(p, enrich);
    });
    return buildCreatorsDirectoryPayload(rows);
  }
}
