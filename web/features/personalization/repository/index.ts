import { isMockDataEnabled } from "@/mock/config";

import type { PersonalizationRepository } from "./personalization-repository";
import { MockPersonalizationRepository } from "./mock-personalization-repository";
import { SupabasePersonalizationRepository } from "./supabase-personalization-repository";

export type { PersonalizationRepository } from "./personalization-repository";
export type {
  AffinityContext,
  DiscoverExploreChip,
  DiscoverExploreSurface,
  ExplorationFeedbackAction,
  FeedRecommendationFeedbackAction,
  InterestIntelligenceSnapshot,
  PersonalizationEvent,
  PersonalizationEventKind,
  WatchFeedbackAction,
  WatchNextCandidate,
  WatchNextRankInput,
} from "../domain/personalization-types";
export type { FeedFeedbackState } from "../domain/feed-feedback-store";
export type { ExplorationFeedbackState } from "../domain/exploration-feedback-store";
export type { WatchFeedbackState } from "../domain/watch-feedback-store";
export type { WatchNextRankOptions } from "../domain/watch-next-rank";
export type { HomeFeedRankOptions } from "../domain/home-feed-rank";
export type { DiscoverFeedRankOptions } from "../domain/discover-feed-rank";

let mockSingleton: MockPersonalizationRepository | null = null;
let supabaseSingleton: SupabasePersonalizationRepository | null = null;

export function getPersonalizationRepository(): PersonalizationRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockPersonalizationRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabasePersonalizationRepository();
  return supabaseSingleton;
}
