import type { FeedPost } from "@/features/feed/types";
import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";

import type {
  AffinityContext,
  DiscoverExploreSurface,
  ExplorationFeedbackAction,
  FeedRecommendationFeedbackAction,
  InterestIntelligenceSnapshot,
  PersonalizationEvent,
  WatchFeedbackAction,
  WatchNextCandidate,
  WatchNextRankInput,
  RecommendationFeedbackAction,
} from "../domain/personalization-types";
import type { FeedFeedbackState } from "../domain/feed-feedback-store";
import type { HomeFeedRankOptions } from "../domain/home-feed-rank";
import type { DiscoverFeedRankOptions } from "../domain/discover-feed-rank";
import type { ExplorationFeedbackState } from "../domain/exploration-feedback-store";
import type { WatchFeedbackState } from "../domain/watch-feedback-store";
import type { RecommendationNetworkBundle } from "../domain/recommendation-network-bundle";
import type { RecommendationMemoryState } from "../domain/recommendation-memory-store";
import type { AdaptiveLearningRecord, RecommendationAdaptationSnapshot } from "../domain/adaptive-learning-types";

export type PersonalizationRepository = {
  recordInteraction(event: Omit<PersonalizationEvent, "ts"> & { ts?: number }): void;
  getAffinityContext(): AffinityContext;
  /** Sinyal / pazar bağlamı — boş nesne değil, her zaman tam şekil */
  getAffinityContextForSignals(): AffinityContext;
  getInterestIntelligence(): InterestIntelligenceSnapshot;
  clearBehavioralMemory(): void;
  resetRecommendationMemory(): void;
  resetAdaptiveLearningMemory(): void;
  /** Ana akış “Senin için” — ilgi grafiği + çeşitlilik + geri bildirim */
  rankHomeFeedForYou(posts: readonly FeedPost[], viewerId: string | null): FeedPost[];
  getHomeFeedRankOptions(viewerId: string | null): HomeFeedRankOptions;
  getFeedFeedbackState(): FeedFeedbackState;
  applyFeedFeedback(action: FeedRecommendationFeedbackAction): void;
  /** Keşfet sekmeleri — keşif ağırlığı + yenilik + tartışma/sinyal bağlamı */
  rankDiscoverFeed(posts: readonly FeedPost[], tab: DiscoverTabId, viewerId: string | null): FeedPost[];
  getDiscoverFeedRankOptions(tab: DiscoverTabId, viewerId: string | null): DiscoverFeedRankOptions;
  getExplorationFeedbackState(): ExplorationFeedbackState;
  applyExplorationFeedback(action: ExplorationFeedbackAction): void;
  getDiscoverExploreSurface(viewerId: string | null): DiscoverExploreSurface;
  /** İzleme oturumu + geçmiş (localStorage) */
  recordWatchSurfaceFocus(params: {
    viewerId: string | null;
    postId: string;
    creatorId: string;
    assetTag: string | null;
    contentFormat: string | null;
  }): void;
  rankWatchNextCandidates(
    candidates: readonly WatchNextCandidate[],
    input: WatchNextRankInput,
    viewerId: string | null,
  ): WatchNextCandidate[];
  getWatchFeedbackState(): WatchFeedbackState;
  applyWatchFeedback(action: WatchFeedbackAction): void;
  /** watch-related sorgu anahtarı için özet */
  getWatchPersonalizationRev(): string;
  getRecommendationNetworkBundle(
    viewerId: string | null,
    context?: { excludeCreatorId?: string | null } | null,
  ): RecommendationNetworkBundle;
  getRecommendationMemoryState(): RecommendationMemoryState;
  applyRecommendationFeedback(action: RecommendationFeedbackAction): void;
  getRecommendationPersonalizationRev(): string;
  /** Oturum / yorgunluk / drift — localStorage adaptasyon belleği */
  recordAdaptiveLearning(rec: AdaptiveLearningRecord): void;
  getRecommendationAdaptationSnapshot(viewerId: string | null): RecommendationAdaptationSnapshot;
  getAdaptiveLearningRev(): string;
};
