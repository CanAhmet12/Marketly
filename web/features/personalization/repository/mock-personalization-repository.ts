import { getHomeRepository } from "@/features/home/repository";
import { getMarketsRepository } from "@/features/markets/repository";
import { MOCK_PROFILE_BY_ID } from "@/mock/fixtures/profiles";
import { getMockFollowingCreatorIds } from "@/mock/fixtures/follows";
import { getSignalsRepository } from "@/features/signals/repository";
import { getSocialRepository } from "@/features/social/repository";

import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";

import { appendBehaviorEvent, clearBehaviorStore, readBehaviorStore } from "../domain/behavioral-store";
import {
  applyFeedFeedbackAction,
  clearFeedFeedbackStore,
  readFeedFeedbackState,
} from "../domain/feed-feedback-store";
import { buildAffinityContext, buildInterestIntelligence } from "../domain/personalization-engine";
import { computeHomeFeedRanking, type HomeFeedRankOptions } from "../domain/home-feed-rank";
import {
  applyExplorationFeedbackAction,
  clearExplorationFeedbackStore,
  readExplorationFeedbackState,
} from "../domain/exploration-feedback-store";
import {
  applyRecommendationFeedbackAction,
  clearRecommendationMemoryStore,
  readRecommendationMemoryState,
} from "../domain/recommendation-memory-store";
import { buildRecommendationNetworkBundle, type RecommendationNetworkBundle, type RecommendationNetworkContext } from "../domain/recommendation-network-bundle";
import {
  readAdaptiveLearningState,
  clearAdaptiveLearningStore,
  mergeAffinityEcho,
} from "../domain/adaptive-learning-store";
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
import {
  applyWatchFeedbackAction,
  clearWatchFeedbackStore,
  readWatchFeedbackState,
} from "../domain/watch-feedback-store";
import { appendWatchHistoryEntry, clearWatchHistoryStore, readWatchHistoryState } from "../domain/watch-history-store";
import { clearWatchSessionStore, readWatchSessionState, setWatchSessionAnchor } from "../domain/watch-session-store";
import { computeWatchNextRanking } from "../domain/watch-next-rank";
import type { WatchNextRankOptions } from "../domain/watch-next-rank";
import { computeDiscoverFeedRanking, type DiscoverFeedRankOptions } from "../domain/discover-feed-rank";
import type {
  AffinityContext,
  DiscoverExploreSurface,
  ExplorationFeedbackAction,
  FeedRecommendationFeedbackAction,
  InterestChip,
  InterestIntelligenceSnapshot,
  PersonalizationEvent,
  WatchFeedbackAction,
  WatchNextCandidate,
  WatchNextRankInput,
  RecommendationFeedbackAction,
} from "../domain/personalization-types";
import type { AdaptiveLearningRecord, RecommendationAdaptationSnapshot } from "../domain/adaptive-learning-types";
import type { FeedPost } from "@/features/feed/types";

import type { PersonalizationRepository } from "./personalization-repository";

function enrichChips(chips: InterestChip[]): InterestChip[] {
  return chips.map((c) => {
    if (c.kind !== "creator") return c;
    const raw = c.id.replace(/^c-/, "");
    const p = MOCK_PROFILE_BY_ID[raw];
    if (!p) return c;
    const name = p.full_name?.trim() || p.username || c.label;
    return { ...c, label: name };
  });
}

function discussionBoostPostIds(): Set<string> {
  const s = getSocialRepository().getDiscussionDiscoverySurface();
  const ids = new Set<string>();
  for (const arr of [s.trending, s.rising, s.market_moving, s.signal_linked_chain, s.active_debates]) {
    for (const r of arr) ids.add(r.post_id);
  }
  return ids;
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

function hotSignalSymbols(): Set<string> {
  const out = new Set<string>();
  for (const r of getSignalsRepository().getFeedRows().slice(0, 18)) {
    if (r.symbol) out.add(String(r.symbol).toUpperCase());
  }
  return out;
}

function enrichSnapshot(s: InterestIntelligenceSnapshot): InterestIntelligenceSnapshot {
  return {
    ...s,
    strongest: enrichChips(s.strongest),
    rising: enrichChips(s.rising),
    fading: enrichChips(s.fading),
  };
}

export class MockPersonalizationRepository implements PersonalizationRepository {
  private homeRankOpts(viewerId: string | null): HomeFeedRankOptions {
    const m = getMarketsRepository();
    const watched = new Set((m.getWatchlistSeed() ?? []).map((x) => String(x).toUpperCase()));
    const portfolio = new Set(m.getPortfolioIntelligenceBundle().portfolioSymbols.map((x) => String(x).toUpperCase()));
    const followed = new Set(getMockFollowingCreatorIds(viewerId));
    const pulse = new Set<string>();
    for (const c of m.getMarketPulseChips()) {
      const tok = c.label.trim().split(/\s+/)[0]?.toUpperCase();
      if (tok) pulse.add(tok);
    }
    const affinity = this.getAffinityContext();
    const feedback = readFeedFeedbackState();
    const coldStart = affinity.meta.eventCount < 5 && followed.size < 2;
    const adaptive = buildAdaptiveFeedRankAdjust(readAdaptiveLearningState(), affinity);
    return {
      affinity,
      feedback,
      watchedSymbols: watched,
      portfolioSymbols: portfolio,
      followedCreatorIds: followed,
      pulseSymbols: pulse,
      coldStart,
      adaptive,
    };
  }

  recordInteraction(event: Omit<PersonalizationEvent, "ts"> & { ts?: number }): void {
    const ts = event.ts ?? Date.now();
    appendBehaviorEvent({ ...event, ts } as PersonalizationEvent);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
    }
  }

  getAffinityContext(): AffinityContext {
    const { events } = readBehaviorStore();
    return buildAffinityContext(events);
  }

  getAffinityContextForSignals(): AffinityContext {
    return this.getAffinityContext();
  }

  getInterestIntelligence(): InterestIntelligenceSnapshot {
    const { events } = readBehaviorStore();
    const ctx = buildAffinityContext(events);
    return enrichSnapshot(buildInterestIntelligence(events, ctx));
  }

  private discoverRankOpts(tab: DiscoverTabId, viewerId: string | null): DiscoverFeedRankOptions {
    const home = this.homeRankOpts(viewerId);
    const affinity = this.getAffinityContext();
    const coldStart = home.coldStart || affinity.meta.eventCount < 8;
    const adaptive = buildAdaptiveFeedRankAdjust(readAdaptiveLearningState(), affinity);
    return {
      tab,
      affinity,
      feedFeedback: readFeedFeedbackState(),
      exploration: readExplorationFeedbackState(),
      watchedSymbols: home.watchedSymbols,
      portfolioSymbols: home.portfolioSymbols,
      followedCreatorIds: home.followedCreatorIds,
      pulseSymbols: home.pulseSymbols,
      discussionBoostPostIds: discussionBoostPostIds(),
      hotSignalSymbols: hotSignalSymbols(),
      coldStart,
      adaptive,
    };
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
    return computeHomeFeedRanking(posts, this.homeRankOpts(viewerId));
  }

  getHomeFeedRankOptions(viewerId: string | null): HomeFeedRankOptions {
    return this.homeRankOpts(viewerId);
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
    return computeDiscoverFeedRanking(posts, this.discoverRankOpts(tab, viewerId));
  }

  getDiscoverFeedRankOptions(tab: DiscoverTabId, viewerId: string | null): DiscoverFeedRankOptions {
    return this.discoverRankOpts(tab, viewerId);
  }

  getExplorationFeedbackState() {
    return readExplorationFeedbackState();
  }

  applyExplorationFeedback(action: ExplorationFeedbackAction): void {
    applyExplorationFeedbackAction(action);
  }

  getDiscoverExploreSurface(viewerId: string | null): DiscoverExploreSurface {
    const intel = this.getInterestIntelligence();
    const m = getMarketsRepository();
    const watched = m.getWatchlistSeed() ?? [];
    const port = m.getPortfolioIntelligenceBundle().portfolioSymbols;
    const followed = getMockFollowingCreatorIds(viewerId);
    const pack = getSocialRepository().getPersonalizedDiscussionRecommendations({
      viewerId,
      watchedSymbols: watched,
      portfolioSymbols: port,
      followedCreatorIds: followed,
    });
    const surf = getSocialRepository().getDiscussionDiscoverySurface();
    const creators = getHomeRepository().getRecommendedCreators();
    const followedSet = new Set(followed);

    const new_discoveries = surf.rising.slice(0, 3).map((r) => ({
      href: r.href,
      label: r.title.length > 42 ? `${r.title.slice(0, 40)}…` : r.title,
      sub: "Yeni keşif",
    }));

    const near_interest = intel.strongest.slice(0, 4).map((c) => ({
      href: c.href,
      label: c.label,
      sub: "İlgi alanına yakın",
    }));

    const rising_topics = [
      ...intel.rising.slice(0, 2).map((c) => ({ href: c.href, label: c.label, sub: "Yükselen konu" })),
      ...intel.marketThemes.slice(0, 2).map((t) => ({
        href: "/discover",
        label: t.label,
        sub: "Makro tema",
      })),
    ];

    const unfollowed_suggestions = creators
      .filter((c) => !followedSet.has(c.id))
      .slice(0, 4)
      .map((c) => ({
        href: `/results?q=${encodeURIComponent((c.handle ?? "").replace(/^@/, ""))}&tab=creators`,
        label: c.name,
        sub: "Takip etmediğin",
      }));

    const portfolio_linked = pack.portfolio.slice(0, 3).map((row) => ({
      href: row.href,
      label: row.label,
      sub: "Portföyünle ilişkili",
    }));

    const watchlist_linked = pack.watchlist.slice(0, 3).map((row) => ({
      href: row.href,
      label: row.label,
      sub: "İzleme listenle ilişkili",
    }));

    const similar_creators = creators
      .filter((c) => !followedSet.has(c.id))
      .slice(4, 8)
      .map((c) => ({
        href: `/results?q=${encodeURIComponent((c.handle ?? "").replace(/^@/, ""))}&tab=creators`,
        label: c.name,
        sub: "Benzer creator",
      }));

    const subline = intel.coldStart ? intel.subline : `${intel.horizonLabel} · ${intel.confidenceLabel}`;

    return {
      new_discoveries,
      near_interest,
      rising_topics,
      unfollowed_suggestions,
      portfolio_linked,
      watchlist_linked,
      similar_creators,
      subline,
    };
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
    appendAdaptiveLearningRecord({
      type: "watch_anchor",
      creatorId: params.creatorId,
      assetUpper: ast,
      format: (params.contentFormat ?? "video").toLowerCase(),
    });
  }

  private watchNextRankOpts(input: WatchNextRankInput, viewerId: string | null): WatchNextRankOptions {
    const home = this.homeRankOpts(viewerId);
    const affinity = this.getAffinityContext();
    const adaptiveWatch = buildAdaptiveWatchMultiplier(readAdaptiveLearningState());
    return {
      input,
      affinity,
      feedFeedback: readFeedFeedbackState(),
      watchFeedback: readWatchFeedbackState(),
      watchedSymbols: home.watchedSymbols,
      portfolioSymbols: home.portfolioSymbols,
      pulseSymbols: home.pulseSymbols,
      discussionBoostPostIds: discussionBoostPostIds(),
      hotSignalSymbols: hotSignalSymbols(),
      bingeByCreatorId: bingeMapFromHistory(),
      coldStart: home.coldStart,
      adaptiveWatch,
    };
  }

  rankWatchNextCandidates(
    candidates: readonly WatchNextCandidate[],
    input: WatchNextRankInput,
    viewerId: string | null,
  ): WatchNextCandidate[] {
    return computeWatchNextRanking(candidates, this.watchNextRankOpts(input, viewerId));
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
    context?: { excludeCreatorId?: string | null } | null,
  ): RecommendationNetworkBundle {
    const m = getMarketsRepository();
    const watched = (m.getWatchlistSeed() ?? []).map((x) => String(x).toUpperCase());
    const portfolio = m.getPortfolioIntelligenceBundle().portfolioSymbols.map((x) => String(x).toUpperCase());
    const followed = new Set(getMockFollowingCreatorIds(viewerId));
    const social = getSocialRepository();
    const pack = social.getPersonalizedDiscussionRecommendations({
      viewerId,
      watchedSymbols: watched,
      portfolioSymbols: portfolio,
      followedCreatorIds: [...followed],
    });
    const ctx: RecommendationNetworkContext = {
      viewerId,
      excludeCreatorId: context?.excludeCreatorId ?? null,
      affinity: this.getAffinityContext(),
      intel: this.getInterestIntelligence(),
      recMem: readRecommendationMemoryState(),
      feedFb: readFeedFeedbackState(),
      exploreFb: readExplorationFeedbackState(),
      watchFb: readWatchFeedbackState(),
      followedCreatorIds: followed,
      creators: getHomeRepository().getRecommendedCreators(),
      topicSurface: social.getDiscoverTopicCommunitySurface(),
      discPack: pack,
      sigRelevance: getSignalsRepository().getPersonalizedSignalRelevance(watched, portfolio),
      portfolioSymbols: portfolio,
      watchedSymbols: watched,
    };
    return buildRecommendationNetworkBundle(ctx);
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
    const affinity = this.getAffinityContext();
    const state = readAdaptiveLearningState();
    const rec = readRecommendationMemoryState();
    const snap = computeRecommendationAdaptationSnapshot({ affinity, state, rec });
    mergeAffinityEcho(affinity);
    return snap;
  }

  getAdaptiveLearningRev(): string {
    const s = readAdaptiveLearningState();
    return [
      s.sessionId,
      s.repeatSkips,
      s.repeatEngagements,
      Math.round(s.explorationPulse * 10),
      Object.keys(s.sessionCreatorHits).length,
      s.updatedAt % 9973,
    ].join(":");
  }
}
