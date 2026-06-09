import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";
import type { FeedPost } from "@/features/feed/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import { appendBehaviorEvent, clearBehaviorStore, readBehaviorStore } from "../domain/behavioral-store";
import { mergeAffinityContexts } from "../domain/affinity-merge";
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

import {
  getLatestLiveRankContext,
  getLiveRankContextCache,
  getLiveRankContextUserId,
} from "../live-rank-context-cache";
import { getServerAffinityCache } from "../server-affinity-cache";
import { scheduleAffinitySync } from "../sync-affinity-to-server";
import { buildAffinityContext, buildInterestIntelligence } from "../domain/personalization-engine";
import {
  getCreatorRecommendationsCache,
  getSignalRecommendationsCache,
} from "@/features/signals/signal-recommendations-cache";
import { AlgoFlags } from "@/lib/algo-flags";

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
  subline: "Piyasalar, sinyaller ve tartışmalar arasında gezindiğinde profilin otomatik güçlenir.",
  strongest: [],
  rising: [],
  fading: [],
  marketThemes: [],
  confidenceLabel: "Veri toplanıyor",
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

function resolveAffinity(viewerId: string | null): AffinityContext {
  const behavioral = readBehaviorStore().events;
  const liveCtx = getLiveRankContextCache(viewerId);
  const liveEvents = liveCtx?.affinityEvents ?? [];
  const allEvents = [...behavioral, ...liveEvents];

  const local = allEvents.length > 0 ? buildAffinityContext(allEvents) : null;
  const server = viewerId ? getServerAffinityCache(viewerId)?.affinity ?? null : null;

  if (local && server) return mergeAffinityContexts(server, local);
  if (local) return local;
  if (server) return server;
  return EMPTY_CTX;
}

function maybeSyncAffinity(viewerId: string | null, ctx: AffinityContext): void {
  if (!viewerId || !isSupabaseConfigured() || typeof window === "undefined") return;
  scheduleAffinitySync(getSupabaseBrowserClient(), ctx, readFeedFeedbackState());
}

function liveRankOpts(viewerId: string | null): HomeFeedRankOptions {
  const ctx = getLiveRankContextCache(viewerId);
  const affinity = resolveAffinity(viewerId);
  const followed = ctx?.followedCreatorIds ?? new Set<string>();
  const watched = ctx?.watchedSymbols ?? new Set<string>();
  const portfolio = ctx?.portfolioSymbols ?? watched;
  const pulse = ctx?.pulseSymbols ?? new Set<string>();
  const coldStart =
    followed.size < 2 &&
    watched.size < 2 &&
    (affinity?.meta.eventCount ?? 0) < 5;
  return {
    affinity,
    feedback: readFeedFeedbackState(),
    watchedSymbols: watched,
    portfolioSymbols: portfolio,
    followedCreatorIds: followed,
    pulseSymbols: pulse,
    coldStart,
    adaptive: buildAdaptiveFeedRankAdjust(readAdaptiveLearningState(), affinity),
  };
}

function liveDiscoverOpts(tab: DiscoverTabId, viewerId: string | null): DiscoverFeedRankOptions {
  const home = liveRankOpts(viewerId);
  return {
    tab,
    affinity: home.affinity,
    feedFeedback: readFeedFeedbackState(),
    exploration: readExplorationFeedbackState(),
    watchedSymbols: home.watchedSymbols,
    portfolioSymbols: home.portfolioSymbols,
    followedCreatorIds: home.followedCreatorIds,
    pulseSymbols: home.pulseSymbols,
    discussionBoostPostIds: new Set(),
    hotSignalSymbols: home.pulseSymbols,
    coldStart: home.coldStart,
    adaptive: home.adaptive ?? buildAdaptiveFeedRankAdjust(readAdaptiveLearningState(), home.affinity),
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
    const ts = event.ts ?? Date.now();
    appendBehaviorEvent({ ...event, ts } as PersonalizationEvent);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
    }
  }

  getAffinityContext(): AffinityContext {
    const viewerId = getLiveRankContextUserId();
    return resolveAffinity(viewerId);
  }

  getAffinityContextForSignals(): AffinityContext {
    return this.getAffinityContext();
  }

  getInterestIntelligence(): InterestIntelligenceSnapshot {
    const viewerId = getLiveRankContextUserId();
    const behavioral = readBehaviorStore().events;
    const liveCtx = getLatestLiveRankContext();
    const allEvents = [...behavioral, ...(liveCtx?.affinityEvents ?? [])];
    if (allEvents.length === 0) return EMPTY_INTEL;
    const ctx = resolveAffinity(viewerId);
    return buildInterestIntelligence(allEvents, ctx);
  }

  clearBehavioralMemory(): void {
    clearBehaviorStore();
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
    return computeHomeFeedRanking(posts, liveRankOpts(viewerId));
  }

  getHomeFeedRankOptions(viewerId: string | null): HomeFeedRankOptions {
    return liveRankOpts(viewerId);
  }

  getFeedFeedbackState() {
    return readFeedFeedbackState();
  }

  applyFeedFeedback(action: FeedRecommendationFeedbackAction): void {
    applyFeedFeedbackAction(action);
    maybeSyncAffinity(getLiveRankContextUserId(), resolveAffinity(getLiveRankContextUserId()));
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
    return computeDiscoverFeedRanking(posts, liveDiscoverOpts(tab, viewerId));
  }

  getDiscoverFeedRankOptions(tab: DiscoverTabId, viewerId: string | null): DiscoverFeedRankOptions {
    return liveDiscoverOpts(tab, viewerId);
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
    void _context;
    if (!AlgoFlags.signalCollaborativeFilter) {
      return { ...EMPTY_REC_BUNDLE };
    }

    const sigRelevance = getSignalRecommendationsCache(viewerId);
    const creatorRecs = getCreatorRecommendationsCache(viewerId);
    if (!sigRelevance.rows.length && !creatorRecs.length) {
      return { ...EMPTY_REC_BUNDLE };
    }

    const affinity = resolveAffinity(viewerId);
    const strategyHints = computeStrategyProfileHints(affinity);
    const excludeId = _context?.excludeCreatorId ?? null;

    const creator_follow = creatorRecs
      .filter((c) => c.creator_id !== excludeId)
      .map((c) => ({
        href: `/channel/${encodeURIComponent(c.creator_id)}`,
        label: c.full_name?.trim() || c.username?.trim() || "Analist",
        sub: "Birlikte takip",
        rel: "Ağ",
        feedbackCreatorId: c.creator_id,
      }));

    const recommended_signals = sigRelevance.rows.slice(0, 5).map((r) => ({
      href: r.href,
      label: `${r.symbol} · ${r.analystDisplay}`,
      sub: "Sinyal",
      rel: r.reason,
      feedbackThemeSlug: r.symbol.replace(/^#/, "").toLowerCase(),
    }));

    const signal_style_peers = sigRelevance.rows.slice(1, 6).map((r) => ({
      href: `/results?q=${encodeURIComponent(r.symbol)}&tab=signals`,
      label: r.symbol,
      sub: "Benzer çağrı",
      rel: "Stil",
      feedbackThemeSlug: r.symbol.replace(/^#/, "").toLowerCase(),
    }));

    return {
      strategyHints,
      creator_follow,
      rising_creators: [],
      premium_analysts: [],
      similar_creators: creator_follow.slice(1, 6),
      related_topics: [],
      rising_communities: [],
      portfolio_themes: [],
      recommended_signals,
      signal_style_peers,
      affinity_line: sigRelevance.headline,
      coldStart: sigRelevance.rows.length < 3,
    };
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
