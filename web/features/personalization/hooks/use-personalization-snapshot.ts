"use client";

import { useSyncExternalStore } from "react";

import { runWithPersonalizationStorageSuppressed } from "../domain/personalization-storage-gate";
import type { AffinityContext, InterestIntelligenceSnapshot } from "../domain/personalization-types";
import { getPersonalizationRepository } from "../repository";

function feedbackDigest(): string {
  const fb = getPersonalizationRepository().getFeedFeedbackState();
  return [
    fb.muteCreators.length,
    fb.muteAssets.length,
    fb.hidePosts.length,
    fb.lessLikePostIds.length,
    fb.moreLikeCreatorIds.length,
    fb.interestedTopics.length,
    fb.notInterestedTopics.length,
  ].join(":");
}

function explorationDigest(): string {
  const ex = getPersonalizationRepository().getExplorationFeedbackState();
  return [
    ex.hideTopics.length,
    ex.notInterestedCreators.length,
    ex.interestedCreators.length,
    ex.interestedThemes.length,
    ex.moreFingerprints.length,
    ex.lessFingerprints.length,
  ].join(":");
}

export type PersonalizationSnapshot = {
  affinity: AffinityContext;
  intel: InterestIntelligenceSnapshot;
  feedbackRev: string;
  explorationRev: string;
  watchRev: string;
  recommendRev: string;
  adaptiveRev: string;
};

function watchDigest(): string {
  return getPersonalizationRepository().getWatchPersonalizationRev();
}

function recommendDigest(): string {
  return getPersonalizationRepository().getRecommendationPersonalizationRev();
}

function adaptiveDigest(): string {
  return getPersonalizationRepository().getAdaptiveLearningRev();
}

function readFresh(): PersonalizationSnapshot {
  const repo = getPersonalizationRepository();
  return {
    affinity: repo.getAffinityContext(),
    intel: repo.getInterestIntelligence(),
    feedbackRev: feedbackDigest(),
    explorationRev: explorationDigest(),
    watchRev: watchDigest(),
    recommendRev: recommendDigest(),
    adaptiveRev: adaptiveDigest(),
  };
}

/** `useSyncExternalStore` — aynı veri için aynı nesne referansı (sonsuz güncelleme uyarısı önlenir). */
function packSnapshotId(s: PersonalizationSnapshot): string {
  const a = s.affinity;
  const i = s.intel;
  const chipKey = (rows: { id: string }[]) => rows.map((r) => r.id).join(",");
  return [
    s.feedbackRev,
    s.explorationRev,
    s.watchRev,
    s.recommendRev,
    s.adaptiveRev,
    a.meta.eventCount,
    a.meta.confidence.toFixed(5),
    a.meta.diversity.toFixed(5),
    a.meta.horizonBias.toFixed(5),
    Object.keys(a.creators).length,
    Object.keys(a.assets).length,
    Object.keys(a.topics).length,
    i.headline,
    i.subline,
    i.confidenceLabel,
    i.horizonLabel,
    i.formatSummary,
    i.coldStart ? "1" : "0",
    chipKey(i.strongest),
    chipKey(i.rising),
    chipKey(i.fading),
    i.marketThemes.map((m) => `${m.id}:${m.scoreLabel}`).join(","),
  ].join("\u001e");
}

let clientSnapshotCache: { id: string; snap: PersonalizationSnapshot } | null = null;
let serverSnapshotCache: { id: string; snap: PersonalizationSnapshot } | null = null;

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("marketly-personalization-updated", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("marketly-personalization-updated", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): PersonalizationSnapshot {
  const snap = readFresh();
  const id = packSnapshotId(snap);
  if (clientSnapshotCache && clientSnapshotCache.id === id) {
    return clientSnapshotCache.snap;
  }
  clientSnapshotCache = { id, snap };
  return snap;
}

/** SSR + hidrasyon: `localStorage` okunmaz — sunucu ile aynı anlık görüntü */
function getServerSnapshot(): PersonalizationSnapshot {
  const snap =
    typeof window === "undefined" ? readFresh() : runWithPersonalizationStorageSuppressed(() => readFresh());
  const id = packSnapshotId(snap);
  if (serverSnapshotCache && serverSnapshotCache.id === id) {
    return serverSnapshotCache.snap;
  }
  serverSnapshotCache = { id, snap };
  return snap;
}

export function usePersonalizationSnapshot(): PersonalizationSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
