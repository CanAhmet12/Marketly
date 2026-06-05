import { isMockDataEnabled } from "@/mock/config";

import type { HomeRepository } from "./home-repository";
import { MockHomeRepository } from "./mock-home-repository";
import { SupabaseHomeRepository } from "./supabase-home-repository";

export type { HomeRepository } from "./home-repository";
export type {
  DiscoverPayload,
  DiscoverTab,
  FeedPost,
  HomeFeedMode,
  HomeFeedPage,
  MarketPulseItem,
  RecommendedCreator,
  StoryRing,
} from "./types";

let mockSingleton: MockHomeRepository | null = null;
let supabaseSingleton: SupabaseHomeRepository | null = null;

export function getHomeRepository(): HomeRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockHomeRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseHomeRepository();
  return supabaseSingleton;
}
