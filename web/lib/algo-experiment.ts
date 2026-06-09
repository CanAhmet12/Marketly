/**
 * Sprint 12 — A/B test & epsilon-greedy bandit atama
 * Spotify BaRT: ε=0.05 keşif, %95 en iyi bilinen varyant
 */

export type AlgoExperimentVariant = "control" | "treatment" | "explore";

export type AlgoExperimentId =
  | "discoverRanking"
  | "signalTrendScore"
  | "homeServerRanking"
  | "hybridSearch"
  | "creatorCompositeScore"
  | "signalCollaborativeFilter"
  | "personalizationServerSync"
  | "marketDataAlgorithms"
  | "notificationPrioritization"
  | "discussionRecommendations";

const EPSILON = 0.05;
const LS_ASSIGN = "marketly-algo-assign-v1";

const ENV_KEYS: Record<AlgoExperimentId, string> = {
  discoverRanking: "NEXT_PUBLIC_ALGO_DISCOVER_RANK",
  signalTrendScore: "NEXT_PUBLIC_ALGO_SIGNAL_TREND",
  homeServerRanking: "NEXT_PUBLIC_ALGO_HOME_RANKING",
  hybridSearch: "NEXT_PUBLIC_ALGO_HYBRID_SEARCH",
  creatorCompositeScore: "NEXT_PUBLIC_ALGO_CREATOR_COMPOSITE",
  signalCollaborativeFilter: "NEXT_PUBLIC_ALGO_SIGNAL_CF",
  personalizationServerSync: "NEXT_PUBLIC_ALGO_PERS_SYNC",
  marketDataAlgorithms: "NEXT_PUBLIC_ALGO_MARKET_DATA",
  notificationPrioritization: "NEXT_PUBLIC_ALGO_NOTIF_PRIO",
  discussionRecommendations: "NEXT_PUBLIC_ALGO_DISCUSSION_REC",
};

function envBool(key: string): boolean {
  if (typeof process === "undefined") return false;
  const v = process.env[key];
  return v === "true" || v === "1";
}

function readAssignments(): Record<string, AlgoExperimentVariant> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_ASSIGN);
    if (!raw) return {};
    const p = JSON.parse(raw) as Record<string, AlgoExperimentVariant>;
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

function writeAssignment(id: AlgoExperimentId, variant: AlgoExperimentVariant): void {
  if (typeof window === "undefined") return;
  try {
    const m = { ...readAssignments(), [id]: variant };
    localStorage.setItem(LS_ASSIGN, JSON.stringify(m));
  } catch {
    /* */
  }
}

/** Yapışkan varyant ataması — oturumlar arası tutarlılık */
export function resolveExperimentVariant(experimentId: AlgoExperimentId): AlgoExperimentVariant {
  const cached = readAssignments()[experimentId];
  if (cached) return cached;

  const envOn = envBool(ENV_KEYS[experimentId]);
  let variant: AlgoExperimentVariant;

  if (envOn) {
    variant = "treatment";
  } else if (Math.random() < EPSILON) {
    variant = "explore";
  } else {
    variant = "control";
  }

  writeAssignment(experimentId, variant);
  return variant;
}

/** Flag aktif mi — treatment veya ε-keşif bucket */
export function isExperimentTreatment(experimentId: AlgoExperimentId): boolean {
  const v = resolveExperimentVariant(experimentId);
  return v === "treatment" || v === "explore";
}

export function getActiveExperiments(): { id: AlgoExperimentId; variant: AlgoExperimentVariant }[] {
  const ids = Object.keys(ENV_KEYS) as AlgoExperimentId[];
  return ids.map((id) => ({ id, variant: resolveExperimentVariant(id) }));
}
