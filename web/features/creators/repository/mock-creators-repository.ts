import { mockChannelPosts } from "@/mock/adapters/channel";
import { getSignalsRepository } from "@/features/signals/repository";
import { MOCK_PROFILES } from "@/mock/fixtures/profiles";
import { CREATOR_ASSET_PRESETS } from "@/features/creators/creators-filters";
import type { CreatorDirectoryPayload } from "@/features/creators/types";
import type { CreatorsRepository } from "@/features/creators/repository/creators-repository";
import { buildCreatorRowFromProfile, pickFeaturedIds, pickLiveNowIds } from "@/features/creators/lib/build-creator-row";

export class MockCreatorsRepository implements CreatorsRepository {
  getDirectoryPayload(_viewerId: string | null): CreatorDirectoryPayload {
    const allSignals = getSignalsRepository().getFeedRows();

    const creators = MOCK_PROFILES.map((profile) => {
      const posts = mockChannelPosts(profile.id);
      const signalRows = allSignals.filter((s) => s.creator_id === profile.id);
      return buildCreatorRowFromProfile(profile, posts, signalRows);
    });

    const featuredIds = pickFeaturedIds(creators);
    const withFeatured = creators.map((c) => ({
      ...c,
      editorPick: featuredIds.includes(c.id),
    }));

    return {
      creators: withFeatured,
      featuredIds,
      liveNowIds: pickLiveNowIds(withFeatured),
      assetPresets: CREATOR_ASSET_PRESETS,
    };
  }
}
