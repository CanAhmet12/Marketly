import type { ChannelSignal } from "@/features/channel/types";
import type { AssetSignalCommunityPulse, SignalThreadPack } from "@/features/signals/community/types";
import type {
  AnalystLeaderboardSection,
  AnalystReputationProfile,
  MarketSignalIntelligence,
  SymbolConsensusIntel,
} from "@/features/signals/intelligence/types";
import type { SignalsHeroPayload } from "@/features/signals/types";

import type { AffinityContext } from "@/features/personalization/domain/personalization-types";

import type { DiscoverSignalCardRow, SignalsFeedRow, SignalsMarketplaceRail, PersonalizedSignalRelevance } from "./types";

export type SignalsRepository = {
  /** `/signals` ana feed */
  getFeedRows(): SignalsFeedRow[];
  computeHero(rows: SignalsFeedRow[]): SignalsHeroPayload;
  /** Keşfet `tab=signals` önizleme kartları */
  getDiscoverSignalCards(limit: number): DiscoverSignalCardRow[];
  /** Sembol gösterim adı (trend listesi / mock eşlemesi) */
  getDisplayNameForSymbol(symbol: string): string;
  /** Varlık detay — ilgili sinyaller */
  getSignalsForAssetSymbol(symbol: string): ChannelSignal[];
  /** Pazar vitrin şeritleri — boş dizi geçerli */
  getMarketplaceRails(): SignalsMarketplaceRail[];
  /** Sinyal tartışma thread paketi — mock üretim */
  getSignalThreadPack(signalId: string): SignalThreadPack | null;
  /** Sembol bazlı topluluk özeti — varlık / izleme yüzeyleri */
  getAssetSignalCommunityPulse(symbol: string): AssetSignalCommunityPulse;
  /** Analist sıralama bölümleri — istihbarat ağı */
  getAnalystLeaderboardSections(): AnalystLeaderboardSection[];
  /** Pazar geneli sinyal istihbaratı */
  getMarketSignalIntelligence(): MarketSignalIntelligence;
  /** Sembol konsensüsü — aktif çağrılar */
  getSymbolConsensusIntel(symbol: string): SymbolConsensusIntel;
  /** Analist itibar profili — skor + rozet */
  getAnalystReputationProfile(analystId: string): AnalystReputationProfile | null;
  /** İzleme + portföy sembollerine göre sinyal önceliği — feed üzerinden */
  getPersonalizedSignalRelevance(
    watchedSymbols: readonly string[],
    portfolioSymbols: readonly string[],
    /** SSR/hidrasyon: `usePersonalizationSnapshot().affinity` ile aynı kaynak */
    affinityOverride?: AffinityContext | null,
  ): PersonalizedSignalRelevance;
};
