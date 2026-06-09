import type { PersonalizedDiscussionPack } from "@/features/social/repository/discussion-discovery-types";

let cached: { userId: string | null; pack: PersonalizedDiscussionPack } | null = null;

const EMPTY: PersonalizedDiscussionPack = {
  for_you: [],
  watchlist: [],
  followed_creators: [],
  portfolio: [],
  room_suggestions: [],
  topic_suggestions: [],
};

export function setDiscussionRecommendationsCache(
  userId: string | null,
  pack: PersonalizedDiscussionPack,
): void {
  cached = { userId, pack };
}

export function getDiscussionRecommendationsCache(userId: string | null): PersonalizedDiscussionPack {
  if (!cached || (userId != null && cached.userId !== userId)) return EMPTY;
  return cached.pack;
}

export function clearDiscussionRecommendationsCache(): void {
  cached = null;
}
