import type { PersonalizedSignalRelevance } from "@/features/signals/repository/types";
import type { CreatorRecommendationRpcRow } from "@/features/signals/fetch-signal-recommendations";

let cached: {
  userId: string | null;
  signals: PersonalizedSignalRelevance;
  creators: CreatorRecommendationRpcRow[];
} | null = null;

const EMPTY: PersonalizedSignalRelevance = { headline: "Öneriler yükleniyor", rows: [] };

export function setSignalRecommendationsCache(
  userId: string | null,
  signals: PersonalizedSignalRelevance,
  creators: CreatorRecommendationRpcRow[] = [],
): void {
  cached = { userId, signals, creators };
}

export function getSignalRecommendationsCache(userId: string | null): PersonalizedSignalRelevance {
  if (!cached || (userId != null && cached.userId !== userId)) return EMPTY;
  return cached.signals;
}

export function getCreatorRecommendationsCache(userId: string | null): CreatorRecommendationRpcRow[] {
  if (!cached || (userId != null && cached.userId !== userId)) return [];
  return cached.creators;
}

export function clearSignalRecommendationsCache(): void {
  cached = null;
}
