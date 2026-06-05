import { isMockDataEnabled } from "@/mock/config";

import { MockSignalsRepository } from "./mock-signals-repository";
import type { SignalsRepository } from "./signals-repository";
import { SupabaseSignalsRepository } from "./supabase-signals-repository";

export type { SignalsRepository } from "./signals-repository";
export type { DiscoverSignalCardRow, PersonalizedSignalRelevance, SignalStrategy, SignalsFeedRow, SignalsPageRow } from "./types";

let mockSingleton: MockSignalsRepository | null = null;
let supabaseSingleton: SupabaseSignalsRepository | null = null;

export function getSignalsRepository(): SignalsRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockSignalsRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseSignalsRepository();
  return supabaseSingleton;
}
