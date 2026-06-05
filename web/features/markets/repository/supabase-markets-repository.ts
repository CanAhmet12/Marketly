import type { MarketDetailExtras, MarketHeroPayload } from "@/features/markets/types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { emptyAssetIntelligenceBundle } from "@/features/markets/lib/asset-intelligence-empty";
import {
  emptyMarketsCommunityNetworkBundle,
  emptyMarketsIntelligenceSurface,
  emptyWatchlistMarketsContext,
} from "@/features/markets/types/markets-intelligence";
import {
  emptyEconomicCalendarIntelligenceBundle,
  emptyMarketNewsroomBundle,
} from "@/features/markets/types/news-calendar-intelligence";
import {
  emptyPortfolioIntelligenceBundle,
  emptyWatchlistIntelligenceBundle,
} from "@/features/markets/types/personal-market-intelligence";

import type {
  EconomicCalendarRow,
  MarketNewsRow,
  MarketsHomePayload,
  MarketsRepository,
  MarketPulseChip,
  PortfolioStripRow,
} from "./markets-repository";

const emptyHero = (): MarketHeroPayload => ({
  headlineMood: "mixed",
  moodLabel: "—",
  moodDetail: "Canlı piyasa bağlantısı bekleniyor.",
  regimeSummary: "—",
  btcDominance: "—",
  fearGreed: { value: 50, label: "Nötr" },
  openMarketsLabel: "—",
  topGainers: [],
  topLosers: [],
  totalVolumeLabel: "—",
  advancers: 0,
  decliners: 0,
  volatilityBand: "low",
  volatilityLabel: "—",
  signalActivityCount: 0,
  activeAnalystCount: 0,
  strongestAssetTheme: "—",
  sentimentPulseLabel: "—",
  updatedAt: "2026-05-16T12:00:00.000Z",
});

/**
 * Üretim: `market_quotes`, `economic_events`, `market_news`, `user_watchlists`, varlık RPC.
 * TODO: Supabase client + RLS; şimdilik boş güvenli yanıtlar.
 */
export class SupabaseMarketsRepository implements MarketsRepository {
  getWatchlistSeed(): readonly string[] | undefined {
    return undefined;
  }

  getDashboardPayload(): MarketsHomePayload | null {
    return { assets: [], hero: emptyHero(), intelligence: emptyMarketsIntelligenceSurface() };
  }

  getWatchlistMarketsContext(_watchedSymbols: readonly string[], _pinnedSymbols: readonly string[]) {
    void _watchedSymbols;
    void _pinnedSymbols;
    return emptyWatchlistMarketsContext();
  }

  getMarketCommunityNetwork() {
    return emptyMarketsCommunityNetworkBundle();
  }

  getWatchlistIntelligenceBundle(watchedSymbols: readonly string[], pinnedSymbols: readonly string[]) {
    const base = emptyWatchlistIntelligenceBundle();
    if (watchedSymbols.length === 0) {
      return {
        ...base,
        onboarding: {
          suggestedSymbols: [],
          trendingThemes: [],
          creatorPicks: [],
          starterLabel: "Piyasalardan sembol ekleyerek kişisel takip istihbaratını açın.",
        },
      };
    }
    return {
      ...base,
      watchedCount: watchedSymbols.length,
      pinnedCount: pinnedSymbols.filter((p) => watchedSymbols.some((w) => w.trim().toUpperCase() === p.trim().toUpperCase())).length,
    };
  }

  getPortfolioIntelligenceBundle() {
    return emptyPortfolioIntelligenceBundle();
  }

  getEconomicCalendar(): EconomicCalendarRow[] {
    return [];
  }

  getMarketNewsStrip(): MarketNewsRow[] {
    return [];
  }

  getMarketNewsroomBundle(_watchedSymbols: readonly string[], _portfolioSymbols: readonly string[]) {
    void _watchedSymbols;
    void _portfolioSymbols;
    return emptyMarketNewsroomBundle();
  }

  getEconomicCalendarIntelligenceBundle(_watchedSymbols: readonly string[], _portfolioSymbols: readonly string[]) {
    void _watchedSymbols;
    void _portfolioSymbols;
    return emptyEconomicCalendarIntelligenceBundle();
  }

  getPortfolioStrip(): PortfolioStripRow[] {
    return [];
  }

  getMarketPulseChips(): MarketPulseChip[] {
    return [];
  }

  getAssetIntelligenceBundle(decodedSymbol: string): AssetIntelligenceBundle | null {
    return emptyAssetIntelligenceBundle(decodedSymbol);
  }

  getMarketDetailExtras(price: number, changePercent: number): MarketDetailExtras {
    void changePercent;
    return {
      support: Math.round(price * 0.99 * 100) / 100,
      resistance: Math.round(price * 1.01 * 100) / 100,
      sentimentScore: 50,
      sentimentLabel: "Nötr",
      relatedSignalsCount: 0,
    };
  }

  getCryptoCategoryDashboard() {
    return null;
  }

  getBistCategoryDashboard() {
    return null;
  }

  getForexCategoryDashboard() {
    return null;
  }

  getCommoditiesCategoryDashboard() {
    return null;
  }

  getNasdaqCategoryDashboard() {
    return null;
  }
}
