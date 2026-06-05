import { isMockDataEnabled } from "@/mock/config";

import { MockMarketsRepository } from "./mock-markets-repository";
import type { MarketsRepository } from "./markets-repository";
import { SupabaseMarketsRepository } from "./supabase-markets-repository";

export type {
  EconomicCalendarRow,
  MarketNewsRow,
  MarketPulseChip,
  MarketsHomePayload,
  MarketsRepository,
  PortfolioStripRow,
} from "./markets-repository";

export type {
  EconomicCalendarIntelEvent,
  EconomicCalendarIntelligenceBundle,
  MarketNewsIntelligenceItem,
  MarketNewsroomBundle,
} from "@/features/markets/types/news-calendar-intelligence";

let mockSingleton: MockMarketsRepository | null = null;
let supabaseSingleton: SupabaseMarketsRepository | null = null;

export function getMarketsRepository(): MarketsRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockMarketsRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseMarketsRepository();
  return supabaseSingleton;
}
