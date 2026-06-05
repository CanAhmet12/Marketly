import type { ChannelSignal } from "@/features/channel/types";
import type { SignalsHeroPayload } from "@/features/signals/types";
import { computeSignalsHero } from "@/features/signals/lib/compute-signals-hero";
import { buildSignalsMarketplaceRails } from "@/features/signals/lib/signals-marketplace-build";
import { getMockSignalsFeedRows } from "@/mock/adapters/signals-dashboard";
import { displayAssetNameForSymbol, getMockSignalsForAssetSymbol, getMockSignalsForDiscover } from "@/mock/adapters/signals-source";
import { buildMockAssetSignalCommunityPulse, buildMockSignalThreadPack } from "@/mock/adapters/signal-thread-pack";
import { buildPersonalizedSignalRelevance } from "@/mock/adapters/personal-signals-relevance";
import { MOCK_PROFILE_BY_ID } from "@/mock/fixtures/profiles";
import type { AffinityContext } from "@/features/personalization/domain/personalization-types";
import { getPersonalizationRepository } from "@/features/personalization/repository";

import {
  aggregateAnalystRows,
  buildAnalystLeaderboardSections,
  buildAnalystReputationProfile,
  buildMarketSignalIntelligence,
  buildSymbolConsensusIntel,
  findAgg,
} from "@/features/signals/lib/signal-intelligence-build";

import type { DiscoverSignalCardRow, SignalsFeedRow } from "./types";
import type { SignalsRepository } from "./signals-repository";

export class MockSignalsRepository implements SignalsRepository {
  getFeedRows(): SignalsFeedRow[] {
    return getMockSignalsFeedRows();
  }

  computeHero(rows: SignalsFeedRow[]): SignalsHeroPayload {
    return computeSignalsHero(rows);
  }

  getDiscoverSignalCards(limit: number): DiscoverSignalCardRow[] {
    return getMockSignalsForDiscover(limit).map((s) => {
      const prof = MOCK_PROFILE_BY_ID[s.creator_id];
      return {
        ...s,
        creatorDisplay: prof?.full_name ?? prof?.username ?? "Analist",
        creatorAvatarUrl: prof?.avatar_url ?? null,
      };
    });
  }

  getDisplayNameForSymbol(symbol: string): string {
    return displayAssetNameForSymbol(symbol);
  }

  getSignalsForAssetSymbol(symbol: string): ChannelSignal[] {
    return getMockSignalsForAssetSymbol(symbol);
  }

  getMarketplaceRails() {
    const affinity = getPersonalizationRepository().getAffinityContextForSignals();
    return buildSignalsMarketplaceRails(this.getFeedRows(), affinity);
  }

  getSignalThreadPack(signalId: string) {
    const row = this.getFeedRows().find((r) => r.id === signalId);
    if (!row) return null;
    return buildMockSignalThreadPack(row);
  }

  getAssetSignalCommunityPulse(symbol: string) {
    return buildMockAssetSignalCommunityPulse(this.getFeedRows(), symbol);
  }

  getAnalystLeaderboardSections() {
    return buildAnalystLeaderboardSections(this.getFeedRows());
  }

  getMarketSignalIntelligence() {
    return buildMarketSignalIntelligence(this.getFeedRows());
  }

  getSymbolConsensusIntel(symbol: string) {
    return buildSymbolConsensusIntel(this.getFeedRows(), symbol);
  }

  getAnalystReputationProfile(analystId: string) {
    const agg = findAgg(aggregateAnalystRows(this.getFeedRows()), analystId);
    return buildAnalystReputationProfile(agg);
  }

  getPersonalizedSignalRelevance(
    watchedSymbols: readonly string[],
    portfolioSymbols: readonly string[],
    affinityOverride?: AffinityContext | null,
  ) {
    const affinity =
      affinityOverride === undefined
        ? getPersonalizationRepository().getAffinityContextForSignals()
        : affinityOverride;
    return buildPersonalizedSignalRelevance(this.getFeedRows(), watchedSymbols, portfolioSymbols, affinity);
  }
}
