import type { MarketDetailExtras } from "@/features/markets/types";
import {
  CRYPTO_MOCK_PHASE1,
  CRYPTO_MOCK_MOVERS,
  CRYPTO_MOCK_SEGMENTS,
  CRYPTO_MOCK_SIGNALS,
  CRYPTO_MOCK_SCREENER,
  CRYPTO_MOCK_BOTTOM_STRIP,
} from "@/features/markets/crypto/data/crypto-mock";
import {
  BIST_MOCK_PULSE,
  BIST_MOCK_MARKET_STATE,
  BIST_MOCK_SECTORS,
  BIST_MOCK_PANELS,
  BIST_MOCK_MOVERS,
  BIST_MOCK_BOTTOM,
  BIST_MOCK_SCREENER,
} from "@/features/markets/bist/data/bist-mock";
import {
  FOREX_MOCK_PULSE,
  FOREX_MOCK_REGIME,
  FOREX_MOCK_CURRENCIES,
  FOREX_MOCK_PANELS,
  FOREX_MOCK_MOVERS,
  FOREX_MOCK_BOTTOM,
  FOREX_MOCK_SCREENER,
} from "@/features/markets/forex/data/forex-mock";

function enrichForexMockMovers(raw: {
  gainers: Omit<ForexMoverItem, "symbol">[];
  losers: Omit<ForexMoverItem, "symbol">[];
  active: Omit<ForexMoverItem, "symbol">[];
}): ForexMoversPayload {
  const withSymbol = (item: Omit<ForexMoverItem, "symbol">): ForexMoverItem => ({
    ...item,
    symbol: item.pair.replace("/", ""),
  });

  return {
    gainers: raw.gainers.map(withSymbol),
    losers: raw.losers.map(withSymbol),
    volume: raw.active.map(withSymbol),
    volatile: raw.gainers.map((item) => ({
      ...withSymbol(item),
      volatility: `${Math.abs(item.changePct).toFixed(2)}%`,
    })),
    active: raw.active.map(withSymbol),
  };
}
import { buildForexTreemapCells } from "@/features/markets/forex/lib/build-forex-treemap";
import { buildForexSignalsPayload } from "@/features/markets/forex/lib/build-forex-signals";
import { filterForexAssets } from "@/features/markets/lib/live-category/live-category-shared";
import type { ForexMoverItem, ForexMoversPayload } from "@/features/markets/forex/types";
import {
  COMMODITY_MOCK_PULSE,
  COMMODITY_MOCK_REGIME,
  COMMODITY_MOCK_CLASSES,
  COMMODITY_MOCK_PANELS,
  COMMODITY_MOCK_MOVERS,
  COMMODITY_MOCK_BOTTOM,
  COMMODITY_MOCK_SCREENER,
} from "@/features/markets/commodities/data/commodities-mock";
import {
  NASDAQ_MOCK_PULSE,
  NASDAQ_MOCK_REGIME,
  NASDAQ_MOCK_SECTORS,
  NASDAQ_MOCK_PANELS,
  NASDAQ_MOCK_MOVERS,
  NASDAQ_MOCK_BOTTOM,
  NASDAQ_MOCK_SCREENER,
} from "@/features/markets/nasdaq/data/nasdaq-mock";
import {
  getMockAssetIntelligenceBundle,
} from "@/mock/adapters/asset-intelligence";
import { buildMarketsIntelligenceSurface } from "@/mock/adapters/markets-intelligence-build";
import {
  buildMockWatchlistMarketsContext,
  buildMarketAssetViews,
  getMockMarketsDashboardPayload,
  getMockEconomicCalendar,
  getMockMarketNews,
  getMockPortfolioStrip,
  mockMarketDetailExtras,
} from "@/mock/adapters/markets-dashboard";
import {
  buildEconomicCalendarIntelligenceBundle,
  buildMarketNewsroomBundle,
} from "@/mock/adapters/news-calendar-intelligence-build";
import { getMockMarketPulseChips } from "@/mock/adapters/market-pulse";
import {
  buildPortfolioIntelligenceBundle,
  buildWatchlistIntelligenceBundle,
} from "@/mock/adapters/personal-market-intelligence-build";
import { MOCK_MARKETS_WATCHLIST_SEED } from "@/mock/markets-watchlist-seed";

import { getSignalsRepository } from "@/features/signals/repository";

import type { MarketsRepository } from "./markets-repository";

export class MockMarketsRepository implements MarketsRepository {
  getWatchlistSeed() {
    return MOCK_MARKETS_WATCHLIST_SEED;
  }

  getDashboardPayload() {
    return getMockMarketsDashboardPayload();
  }

  getWatchlistMarketsContext(watchedSymbols: readonly string[], pinnedSymbols: readonly string[]) {
    return buildMockWatchlistMarketsContext(watchedSymbols, pinnedSymbols);
  }

  getMarketCommunityNetwork() {
    const assets = buildMarketAssetViews();
    const sig = getSignalsRepository().getMarketSignalIntelligence();
    const intel = buildMarketsIntelligenceSurface(assets, sig);
    return {
      live: intel.liveConversation,
      community: intel.communityIntel,
      crossAssetChains: intel.crossAssetChains,
      socialMechanics: intel.discussionSocialMechanics,
    };
  }

  getWatchlistIntelligenceBundle(watchedSymbols: readonly string[], pinnedSymbols: readonly string[]) {
    return buildWatchlistIntelligenceBundle(watchedSymbols, pinnedSymbols);
  }

  getPortfolioIntelligenceBundle() {
    return buildPortfolioIntelligenceBundle();
  }

  getEconomicCalendar() {
    return getMockEconomicCalendar();
  }

  getMarketNewsStrip() {
    return getMockMarketNews();
  }

  getMarketNewsroomBundle(watchedSymbols: readonly string[], portfolioSymbols: readonly string[]) {
    return buildMarketNewsroomBundle(
      this.getMarketNewsStrip(),
      getSignalsRepository().getFeedRows(),
      watchedSymbols,
      portfolioSymbols,
    );
  }

  getEconomicCalendarIntelligenceBundle(watchedSymbols: readonly string[], portfolioSymbols: readonly string[]) {
    return buildEconomicCalendarIntelligenceBundle(
      this.getEconomicCalendar(),
      getSignalsRepository().getFeedRows(),
      watchedSymbols,
      portfolioSymbols,
    );
  }

  getPortfolioStrip() {
    return getMockPortfolioStrip();
  }

  getMarketPulseChips() {
    return getMockMarketPulseChips();
  }

  getAssetIntelligenceBundle(decodedSymbol: string) {
    return getMockAssetIntelligenceBundle(decodedSymbol);
  }

  getMarketDetailExtras(price: number, changePercent: number): MarketDetailExtras {
    return mockMarketDetailExtras(price, changePercent);
  }

  getCryptoCategoryDashboard() {
    return {
      phase1:      CRYPTO_MOCK_PHASE1,
      movers:      CRYPTO_MOCK_MOVERS,
      segments:    CRYPTO_MOCK_SEGMENTS,
      signals:     CRYPTO_MOCK_SIGNALS,
      screener:    CRYPTO_MOCK_SCREENER,
      bottomStrip: CRYPTO_MOCK_BOTTOM_STRIP,
    };
  }

  getBistCategoryDashboard() {
    return {
      pulse:       BIST_MOCK_PULSE,
      marketState: BIST_MOCK_MARKET_STATE,
      sectors:     BIST_MOCK_SECTORS,
      panels:      BIST_MOCK_PANELS,
      movers:      BIST_MOCK_MOVERS,
      bottom:      BIST_MOCK_BOTTOM,
      screener:    BIST_MOCK_SCREENER,
    };
  }

  getForexCategoryDashboard() {
    const volumeByPair = Object.fromEntries(
      FOREX_MOCK_MOVERS.active.map((m) => [m.pair, m.volume ?? "—"]),
    );
    const screenerAssets = FOREX_MOCK_SCREENER.assets.map((asset) => ({
      ...asset,
      symbol: asset.symbol ?? asset.pair.replace("/", ""),
      volume: asset.volume ?? volumeByPair[asset.pair] ?? "—",
    }));
    const dashboard = this.getDashboardPayload();
    const forexAssets = dashboard ? filterForexAssets(dashboard.assets) : [];
    const signals = forexAssets.length
      ? buildForexSignalsPayload(forexAssets)
      : {
          totalActiveSignals: 24,
          bullPct: 58,
          bearPct: 42,
          marketBiasLabel: "Alış ağırlıklı",
          topAssets: screenerAssets.slice(0, 6).map((a) => ({
            symbol: a.symbol,
            pair: a.pair,
            activeSignals: 3,
            bullPct: a.changePct >= 0 ? 62 : 38,
            biasLabel: a.changePct >= 0 ? "Alış bias" : "Satış bias",
            avgConfidence: 72,
            dominantDirection: a.changePct >= 0 ? ("BUY" as const) : ("SELL" as const),
          })),
        };

    return {
      pulse: FOREX_MOCK_PULSE,
      regime: FOREX_MOCK_REGIME,
      currencies: FOREX_MOCK_CURRENCIES,
      panels: FOREX_MOCK_PANELS,
      movers: enrichForexMockMovers(FOREX_MOCK_MOVERS),
      bottom: FOREX_MOCK_BOTTOM,
      signals,
      screener: { assets: screenerAssets },
      treemap: { cells: buildForexTreemapCells(screenerAssets) },
    };
  }

  getCommoditiesCategoryDashboard() {
    return {
      pulse:   COMMODITY_MOCK_PULSE,
      regime:  COMMODITY_MOCK_REGIME,
      classes: COMMODITY_MOCK_CLASSES,
      panels:  COMMODITY_MOCK_PANELS,
      movers:  COMMODITY_MOCK_MOVERS,
      bottom:  COMMODITY_MOCK_BOTTOM,
      screener: COMMODITY_MOCK_SCREENER,
    };
  }

  getNasdaqCategoryDashboard() {
    return {
      pulse:   NASDAQ_MOCK_PULSE,
      regime:  NASDAQ_MOCK_REGIME,
      sectors: NASDAQ_MOCK_SECTORS,
      panels:  NASDAQ_MOCK_PANELS,
      movers:  NASDAQ_MOCK_MOVERS,
      bottom:  NASDAQ_MOCK_BOTTOM,
      screener: NASDAQ_MOCK_SCREENER,
    };
  }
}
