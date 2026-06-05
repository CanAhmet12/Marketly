import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";
import type { FeedPost } from "@/features/feed/types";
import { applyFeedFeedbackAction, clearFeedFeedbackStore, readFeedFeedbackState } from "../domain/feed-feedback-store";
import {
  applyExplorationFeedbackAction,
  clearExplorationFeedbackStore,
  readExplorationFeedbackState,
} from "../domain/exploration-feedback-store";
import {
  applyWatchFeedbackAction,
  clearWatchFeedbackStore,
  readWatchFeedbackState,
} from "../domain/watch-feedback-store";
import { appendWatchHistoryEntry, clearWatchHistoryStore, readWatchHistoryState } from "../domain/watch-history-store";
import { clearWatchSessionStore, readWatchSessionState, setWatchSessionAnchor } from "../domain/watch-session-store";
import { computeDiscoverFeedRanking, type DiscoverFeedRankOptions } from "../domain/discover-feed-rank";
import { computeHomeFeedRanking, type HomeFeedRankOptions } from "../domain/home-feed-rank";
import { computeWatchNextRanking } from "../domain/watch-next-rank";
import type { WatchNextRankOptions } from "../domain/watch-next-rank";
import type {
  AffinityContext,
  DiscoverExploreSurface,
  ExplorationFeedbackAction,
  FeedRecommendationFeedbackAction,
  InterestIntelligenceSnapshot,
  PersonalizationEvent,
  RecommendationFeedbackAction,
  WatchFeedbackAction,
  WatchNextCandidate,
  WatchNextRankInput,
} from "../domain/personalization-types";
import {
  applyRecommendationFeedbackAction,
  clearRecommendationMemoryStore,
  readRecommendationMemoryState,
} from "../domain/recommendation-memory-store";
import { computeStrategyProfileHints, type RecommendationNetworkBundle } from "../domain/recommendation-network-bundle";
import { readAdaptiveLearningState, clearAdaptiveLearningStore } from "../domain/adaptive-learning-store";
import {
  recordAdaptiveLearning as appendAdaptiveLearningRecord,
  recordAdaptiveFromRecommendationLessCreator,
  recordAdaptiveFromRecommendationHideCreator,
} from "../domain/adaptive-learning-records";
import {
  buildAdaptiveFeedRankAdjust,
  buildAdaptiveWatchMultiplier,
  computeRecommendationAdaptationSnapshot,
} from "../domain/adaptive-learning-engine";
import type { AdaptiveLearningRecord, RecommendationAdaptationSnapshot } from "../domain/adaptive-learning-types";

import type { PersonalizationRepository } from "./personalization-repository";

const EMPTY_CTX: AffinityContext = {
  creators: {},
  assets: {},
  topics: {},
  signals: {},
  rooms: {},
  discussions: {},
  formats: {},
  meta: { eventCount: 0, confidence: 0, diversity: 0.35, horizonBias: 0 },
};

const EMPTY_INTEL: InterestIntelligenceSnapshot = {
  headline: "İlgi grafiği",
  subline: "Canlı modda sunucu tarafı kişiselleştirme yakında — davranış belleği henüz bağlı değil.",
  strongest: [],
  rising: [],
  fading: [],
  marketThemes: [],
  confidenceLabel: "Sunucu verisi bekleniyor",
  horizonLabel: "Nötr",
  formatSummary: "—",
  coldStart: true,
};

const EMPTY_REC_BUNDLE: RecommendationNetworkBundle = {
  strategyHints: computeStrategyProfileHints(null),
  creator_follow: [],
  rising_creators: [],
  premium_analysts: [],
  similar_creators: [],
  related_topics: [],
  rising_communities: [],
  portfolio_themes: [],
  recommended_signals: [],
  signal_style_peers: [],
  affinity_line: EMPTY_INTEL.subline,
  coldStart: true,
};

function liveRankOpts(): HomeFeedRankOptions {
  return {
    affinity: null,
    feedback: readFeedFeedbackState(),
    watchedSymbols: new Set(),
    portfolioSymbols: new Set(),
    followedCreatorIds: new Set(),
    pulseSymbols: new Set(),
    coldStart: false,
    adaptive: buildAdaptiveFeedRankAdjust(readAdaptiveLearningState(), null),
  };
}

function liveDiscoverOpts(tab: DiscoverTabId): DiscoverFeedRankOptions {
  return {
    tab,
    affinity: null,
    feedFeedback: readFeedFeedbackState(),
    exploration: readExplorationFeedbackState(),
    watchedSymbols: new Set(),
    portfolioSymbols: new Set(),
    followedCreatorIds: new Set(),
    pulseSymbols: new Set(),
    discussionBoostPostIds: new Set(),
    hotSignalSymbols: new Set(),
    coldStart: false,
    adaptive: buildAdaptiveFeedRankAdjust(readAdaptiveLearningState(), null),
  };
}

function bingeMapFromHistory(): Record<string, number> {
  const now = Date.now();
  const win = 45 * 60 * 1000;
  const m: Record<string, number> = {};
  for (const e of readWatchHistoryState().entries) {
    if (now - e.ts > win) continue;
    m[e.creatorId] = (m[e.creatorId] ?? 0) + 1;
  }
  return m;
}

function liveWatchNextOpts(input: WatchNextRankInput): WatchNextRankOptions {
  return {
    input,
    affinity: null,
    feedFeedback: readFeedFeedbackState(),
    watchFeedback: readWatchFeedbackState(),
    watchedSymbols: new Set(),
    portfolioSymbols: new Set(),
    pulseSymbols: new Set(),
    discussionBoostPostIds: new Set(),
    hotSignalSymbols: new Set(),
    bingeByCreatorId: bingeMapFromHistory(),
    coldStart: false,
    adaptiveWatch: buildAdaptiveWatchMultiplier(readAdaptiveLearningState()),
  };
}

const EMPTY_EXPLORE: DiscoverExploreSurface = {
  new_discoveries: [],
  near_interest: [],
  rising_topics: [],
  unfollowed_suggestions: [],
  portfolio_linked: [],
  watchlist_linked: [],
  similar_creators: [],
  subline: "",
};

export class SupabasePersonalizationRepository implements PersonalizationRepository {
  recordInteraction(event: Omit<PersonalizationEvent, "ts"> & { ts?: number }): void {
    void event;
    /* Edge ingest / RPC ile doldurulacak */
  }

  getAffinityContext(): AffinityContext {
    return EMPTY_CTX;
  }

  getAffinityContextForSignals(): AffinityContext {
    return EMPTY_CTX;
  }

  getInterestIntelligence(): InterestIntelligenceSnapshot {
    return EMPTY_INTEL;
  }

  clearBehavioralMemory(): void {
    clearFeedFeedbackStore();
    clearExplorationFeedbackStore();
    clearWatchFeedbackStore();
    clearWatchHistoryStore();
    clearWatchSessionStore();
    clearRecommendationMemoryStore();
    clearAdaptiveLearningStore();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
    }
  }

  resetRecommendationMemory(): void {
    clearRecommendationMemoryStore();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
    }
  }

  resetAdaptiveLearningMemory(): void {
    clearAdaptiveLearningStore();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
    }
  }

  rankHomeFeedForYou(posts: readonly FeedPost[], viewerId: string | null): FeedPost[] {
    void viewerId;
    return computeHomeFeedRanking(posts, liveRankOpts());
  }

  getHomeFeedRankOptions(viewerId: string | null): HomeFeedRankOptions {
    void viewerId;
    return liveRankOpts();
  }

  getFeedFeedbackState() {
    return readFeedFeedbackState();
  }

  applyFeedFeedback(action: FeedRecommendationFeedbackAction): void {
    applyFeedFeedbackAction(action);
    switch (action.type) {
      case "mute_creator":
        appendAdaptiveLearningRecord({ type: "negative_creator", creatorId: action.creatorId });
        break;
      case "mute_asset":
        appendAdaptiveLearningRecord({ type: "negative_theme", token: action.symbol.trim().toLowerCase() });
        break;
      case "not_interested_topic":
        appendAdaptiveLearningRecord({ type: "negative_theme", token: action.token });
        break;
      case "more_like":
        appendAdaptiveLearningRecord({ type: "positive_creator", creatorId: action.creatorId });
        break;
      default:
        break;
    }
  }

  rankDiscoverFeed(posts: readonly FeedPost[], tab: DiscoverTabId, viewerId: string | null): FeedPost[] {
    void viewerId;
    return computeDiscoverFeedRanking(posts, liveDiscoverOpts(tab));
  }

  getDiscoverFeedRankOptions(tab: DiscoverTabId, viewerId: string | null): DiscoverFeedRankOptions {
    void viewerId;
    return liveDiscoverOpts(tab);
  }

  getExplorationFeedbackState() {
    return readExplorationFeedbackState();
  }

  applyExplorationFeedback(action: ExplorationFeedbackAction): void {
    applyExplorationFeedbackAction(action);
  }

  getDiscoverExploreSurface(viewerId: string | null): DiscoverExploreSurface {
    void viewerId;
    return { ...EMPTY_EXPLORE, subline: EMPTY_INTEL.subline };
  }

  recordWatchSurfaceFocus(params: {
    viewerId: string | null;
    postId: string;
    creatorId: string;
    assetTag: string | null;
    contentFormat: string | null;
  }): void {
    void params.viewerId;
    setWatchSessionAnchor({
      postId: params.postId,
      creatorId: params.creatorId,
      assetTag: params.assetTag,
      format: params.contentFormat,
    });
    const ast = params.assetTag?.replace(/^#/, "").trim().toUpperCase() || null;
    appendWatchHistoryEntry({
      postId: params.postId,
      creatorId: params.creatorId,
      assetUpper: ast,
      format: (params.contentFormat ?? "video").toLowerCase(),
    });
  }

  rankWatchNextCandidates(
    candidates: readonly WatchNextCandidate[],
    input: WatchNextRankInput,
    viewerId: string | null,
  ): WatchNextCandidate[] {
    void viewerId;
    return computeWatchNextRanking(candidates, liveWatchNextOpts(input));
  }

  getWatchFeedbackState() {
    return readWatchFeedbackState();
  }

  applyWatchFeedback(action: WatchFeedbackAction): void {
    applyWatchFeedbackAction(action);
  }

  getWatchPersonalizationRev(): string {
    const wf = readWatchFeedbackState();
    const wh = readWatchHistoryState();
    const ws = readWatchSessionState();
    return [
      wf.morePostIds.length,
      wf.lessPostIds.length,
      wf.hideCreators.length,
      wf.hideTopics.length,
      wf.interestedFormats.length,
      wf.interestedThemes.length,
      wh.entries.length,
      ws.updatedAt,
    ].join(":");
  }

  getRecommendationNetworkBundle(
    viewerId: string | null,
    _context?: { excludeCreatorId?: string | null } | null,
  ): RecommendationNetworkBundle {
    void viewerId;
    void _context;
    return { ...EMPTY_REC_BUNDLE };
  }

  getRecommendationMemoryState() {
    return readRecommendationMemoryState();
  }

  applyRecommendationFeedback(action: RecommendationFeedbackAction): void {
    applyRecommendationFeedbackAction(action);
    switch (action.type) {
      case "rec_less_creator":
        recordAdaptiveFromRecommendationLessCreator(action.creatorId);
        break;
      case "rec_hide_creator":
        recordAdaptiveFromRecommendationHideCreator(action.creatorId);
        break;
      case "rec_follow_interest":
        appendAdaptiveLearningRecord({ type: "positive_creator", creatorId: action.creatorId });
        break;
      default:
        break;
    }
  }

  getRecommendationPersonalizationRev(): string {
    const r = readRecommendationMemoryState();
    return [
      r.hideCreatorIds.length,
      r.lessCreatorIds.length,
      r.followInterestCreatorIds.length,
      r.interestedStrategies.length,
      r.interestedTimeframes.length,
      r.interestedMarketThemes.length,
    ].join(":");
  }

  recordAdaptiveLearning(rec: AdaptiveLearningRecord): void {
    appendAdaptiveLearningRecord(rec);
  }

  getRecommendationAdaptationSnapshot(viewerId: string | null): RecommendationAdaptationSnapshot {
    void viewerId;
    return computeRecommendationAdaptationSnapshot({
      affinity: EMPTY_CTX,
      state: readAdaptiveLearningState(),
      rec: readRecommendationMemoryState(),
    });
  }

  getAdaptiveLearningRev(): string {
    const s = readAdaptiveLearningState();
    return [
      s.sessionId,
      s.repeatSkips,
      s.repeatEngagements,
      Math.round(s.explorationPulse * 10),
      s.updatedAt % 9973,
    ].join(":");
  }
}
