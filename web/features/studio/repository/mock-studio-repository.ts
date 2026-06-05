import { MOCK_APP_VIEWER_PROFILE_ID } from "@/mock/authentication";
import { getStudioDrafts, getStudioScheduledPosts } from "@/mock/adapters/creator-studio-publishing";
import { getStudioAnalyticsBundle } from "@/mock/adapters/creator-studio-analytics";
import { getStudioContentItems } from "@/mock/adapters/creator-studio-content";
import { getStudioDashboardOverview } from "@/mock/adapters/creator-studio-dashboard";
import { getStudioLiveSchedule } from "@/mock/adapters/creator-studio-live";
import { getStudioPlaylists, resolveMockPlaylistById } from "@/mock/adapters/creator-studio-playlists";
import { getStudioShellNotice, getStudioShellSubtitle } from "@/mock/adapters/creator-studio-ui";
import { isMockDataEnabled } from "@/mock/config";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";

import type { StudioRepository } from "./studio-repository";
import { assembleCreatorStudioEconomyHub } from "./assemble-creator-studio-economy-hub";
import type { StudioLocalMutations, StudioTimeframe } from "./types";

function resolveOwnerForMockDataset(authUserId: string): string {
  const n = MOCK_POST_SOURCES.filter((p) => p.user_id === authUserId).length;
  if (n > 0) return authUserId;
  return MOCK_APP_VIEWER_PROFILE_ID;
}

export class MockStudioRepository implements StudioRepository {
  resolveEffectiveOwnerId(authUserId: string): string {
    return resolveOwnerForMockDataset(authUserId);
  }

  getDashboardOverview(ownerId: string, local: StudioLocalMutations) {
    return getStudioDashboardOverview(ownerId, local, true);
  }

  getContentItems(ownerId: string, local: StudioLocalMutations) {
    return getStudioContentItems(ownerId, local, true);
  }

  getAnalyticsBundle(ownerId: string, timeframe: StudioTimeframe) {
    return getStudioAnalyticsBundle(ownerId, timeframe, true);
  }

  getDrafts(ownerId: string, local: StudioLocalMutations) {
    return getStudioDrafts(ownerId, local, true);
  }

  getScheduledPosts(ownerId: string, local: StudioLocalMutations) {
    return getStudioScheduledPosts(ownerId, local, true);
  }

  getPlaylists(ownerId: string) {
    return getStudioPlaylists(ownerId, true);
  }

  getPlaylistById(playlistId: string) {
    return resolveMockPlaylistById(playlistId, true);
  }

  getLiveSchedule(ownerId: string) {
    return getStudioLiveSchedule(ownerId, true);
  }

  getShellNotice(): string | null {
    return getStudioShellNotice(isMockDataEnabled());
  }

  getShellSubtitle(): string {
    return getStudioShellSubtitle();
  }

  getCreatorEconomyHub(ownerId: string) {
    return assembleCreatorStudioEconomyHub(ownerId);
  }
}
