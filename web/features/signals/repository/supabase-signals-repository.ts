import type { ChannelSignal } from "@/features/channel/types";
import { EMPTY_ASSET_SIGNAL_COMMUNITY_PULSE } from "@/features/signals/community/types";
import {
  EMPTY_MARKET_SIGNAL_INTELLIGENCE,
  emptySymbolConsensusIntel,
} from "@/features/signals/intelligence/types";
import type { SignalsHeroPayload } from "@/features/signals/types";

import type { AffinityContext } from "@/features/personalization/domain/personalization-types";

import { computeSignalsHero } from "@/features/signals/lib/compute-signals-hero";
import { fetchSignalsFeed } from "@/features/signals/fetch-signals-feed";
import { getSignalRecommendationsCache } from "@/features/signals/signal-recommendations-cache";
import { AlgoFlags } from "@/lib/algo-flags";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import type { DiscoverSignalCardRow, SignalsFeedRow, SignalsMarketplaceRail } from "./types";
import { emptyPersonalizedSignalRelevance } from "./types";
import type { SignalsRepository } from "./signals-repository";

const emptyHero = (): SignalsHeroPayload => ({
  activeCount: 0,
  buyCount: 0,
  sellCount: 0,
  holdCount: 0,
  successRate: null,
  avgConfidence: 0,
  lastStrong: null,
  pulseLabel: "—",
  updatedAt: new Date().toISOString(),
});

/**
 * Üretim: `signals` tablosu + analist JOIN + RPC (hero metrikleri).
 * TODO: Supabase client ile sayfalı feed; sparkline için ayrı time-series endpoint.
 */
export class SupabaseSignalsRepository implements SignalsRepository {
  private cache: SignalsFeedRow[] | null = null;

  getFeedRows(): SignalsFeedRow[] {
    return this.cache ?? [];
  }

  /** Tarayıcıda async doldurma — `useSignalsCatalog` tercih edilir. */
  async hydrateFeedCache(): Promise<SignalsFeedRow[]> {
    if (!isSupabaseConfigured()) return [];
    const rows = await fetchSignalsFeed(getSupabaseBrowserClient());
    this.cache = rows;
    return rows;
  }

  computeHero(rows: SignalsFeedRow[]): SignalsHeroPayload {
    if (rows.length === 0) return emptyHero();
    return computeSignalsHero(rows);
  }

  getDiscoverSignalCards(limit: number): DiscoverSignalCardRow[] {
    void limit;
    return [];
  }

  getDisplayNameForSymbol(symbol: string): string {
    return symbol.trim();
  }

  getSignalsForAssetSymbol(symbol: string): ChannelSignal[] {
    void symbol;
    return [];
  }

  /** Live: `useSignalsCatalog` → `buildLiveSignalsMarketplaceRails` */
  getMarketplaceRails(): SignalsMarketplaceRail[] {
    return [];
  }

  getSignalThreadPack(signalId: string) {
    void signalId;
    return null;
  }

  getAssetSignalCommunityPulse(symbol: string) {
    void symbol;
    return EMPTY_ASSET_SIGNAL_COMMUNITY_PULSE;
  }

  /** Live: `useSignalsCatalog` → RPC + feed aggregation */
  getAnalystLeaderboardSections() {
    return [];
  }

  getMarketSignalIntelligence() {
    return EMPTY_MARKET_SIGNAL_INTELLIGENCE;
  }

  getSymbolConsensusIntel(symbol: string) {
    return emptySymbolConsensusIntel(symbol);
  }

  getAnalystReputationProfile(analystId: string) {
    void analystId;
    return null;
  }

  getPersonalizedSignalRelevance(
    _watchedSymbols: readonly string[],
    _portfolioSymbols: readonly string[],
    _affinityOverride?: AffinityContext | null,
  ) {
    void _watchedSymbols;
    void _portfolioSymbols;
    void _affinityOverride;
    if (AlgoFlags.signalCollaborativeFilter) {
      const cached = getSignalRecommendationsCache(null);
      if (cached.rows.length) return cached;
    }
    return emptyPersonalizedSignalRelevance();
  }
}
