import type { MarketDetailExtras } from "@/features/markets/types";
import { buildCryptoTreemapCells } from "@/features/markets/crypto/lib/build-crypto-treemap";
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
import { buildBistSignalsPayload } from "@/features/markets/bist/lib/build-bist-signals";
import { buildBistTreemapCells } from "@/features/markets/bist/lib/build-bist-treemap";
import { enrichBistMockMovers } from "@/features/markets/bist/lib/bist-intel-utils";
import type { BistIndexPanel } from "@/features/markets/bist/types";
import { filterBistAssets } from "@/features/markets/lib/live-category/live-category-shared";
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
import { buildCommodityTreemapCells } from "@/features/markets/commodities/lib/build-commodity-treemap";
import { buildCommoditySignalsPayload } from "@/features/markets/commodities/lib/build-commodity-signals";
import { enrichCommodityMockMovers } from "@/features/markets/commodities/lib/commodity-intel-utils";
import type { CommodityAssetPanel, CommodityPulseMetrics } from "@/features/markets/commodities/types";
import { filterCommodityAssets } from "@/features/markets/lib/live-category/live-category-shared";
import {
  NASDAQ_MOCK_PULSE,
  NASDAQ_MOCK_REGIME,
  NASDAQ_MOCK_SECTORS,
  NASDAQ_MOCK_PANELS,
  NASDAQ_MOCK_MOVERS,
  NASDAQ_MOCK_BOTTOM,
  NASDAQ_MOCK_SCREENER,
} from "@/features/markets/nasdaq/data/nasdaq-mock";
import { buildNasdaqSignalsPayload } from "@/features/markets/nasdaq/lib/build-nasdaq-signals";
import { buildNasdaqTreemapCells } from "@/features/markets/nasdaq/lib/build-nasdaq-treemap";
import { enrichNasdaqMockMovers } from "@/features/markets/nasdaq/lib/nasdaq-intel-utils";
import type { NasdaqIndexPanel } from "@/features/markets/nasdaq/types";
import { filterNasdaqAssets } from "@/features/markets/lib/live-category/live-category-shared";
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
    const screenerAssets = CRYPTO_MOCK_SCREENER.assets;
    return {
      phase1:      CRYPTO_MOCK_PHASE1,
      movers:      CRYPTO_MOCK_MOVERS,
      segments:    CRYPTO_MOCK_SEGMENTS,
      signals:     CRYPTO_MOCK_SIGNALS,
      screener:    CRYPTO_MOCK_SCREENER,
      bottomStrip: CRYPTO_MOCK_BOTTOM_STRIP,
      treemap:     { cells: buildCryptoTreemapCells(screenerAssets) },
    };
  }

  getBistCategoryDashboard() {
    const screenerAssets = BIST_MOCK_SCREENER.assets;
    const dashboard = this.getDashboardPayload();
    const bistAssets = dashboard ? filterBistAssets(dashboard.assets) : [];

    const bistBankaPanel: BistIndexPanel = {
      symbol: "BISTBANK",
      name: "BIST Banka",
      value: BIST_MOCK_PULSE.bistBanka.value,
      changePercent: BIST_MOCK_PULSE.bistBanka.changePercent,
      changeDay: (BIST_MOCK_PULSE.bistBanka.value * BIST_MOCK_PULSE.bistBanka.changePercent) / 100,
      sparkline: BIST_MOCK_PULSE.bistBanka.sparkline,
      trend: BIST_MOCK_PULSE.bistBanka.changePercent >= 0 ? "up" : "down",
      stats: {
        marketCap: "—",
        volume: "—",
        highDay: BIST_MOCK_PULSE.bistBanka.value.toLocaleString("tr-TR"),
        lowDay: (BIST_MOCK_PULSE.bistBanka.value * 0.99).toLocaleString("tr-TR"),
      },
    };

    const signals = bistAssets.length
      ? buildBistSignalsPayload(bistAssets)
      : {
          totalActiveSignals: 18,
          bullPct: 62,
          bearPct: 38,
          marketBiasLabel: "Alış ağırlıklı",
          topAssets: screenerAssets.slice(0, 6).map((a) => ({
            symbol: a.symbol,
            name: a.name,
            activeSignals: 2,
            bullPct: a.changeDay >= 0 ? 64 : 36,
            biasLabel: a.changeDay >= 0 ? "Alış bias" : "Satış bias",
            avgConfidence: 68,
            dominantDirection: a.changeDay >= 0 ? ("BUY" as const) : ("SELL" as const),
          })),
        };

    return {
      pulse: BIST_MOCK_PULSE,
      marketState: BIST_MOCK_MARKET_STATE,
      sectors: BIST_MOCK_SECTORS,
      panels: {
        bist100: BIST_MOCK_PANELS.bist100,
        bist30: BIST_MOCK_PANELS.bist30,
        bistBanka: bistBankaPanel,
      },
      movers: enrichBistMockMovers(BIST_MOCK_MOVERS),
      bottom: BIST_MOCK_BOTTOM,
      signals,
      screener: BIST_MOCK_SCREENER,
      treemap: { cells: buildBistTreemapCells(screenerAssets) },
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
    const screenerAssets = COMMODITY_MOCK_SCREENER.assets;
    const pulse: CommodityPulseMetrics = {
      ...COMMODITY_MOCK_PULSE,
      endeks: {
        ...COMMODITY_MOCK_PULSE.endeks,
        label: "Bloomberg CCI",
      },
      volatility: COMMODITY_MOCK_PULSE.volatility ?? { value: 48, label: "Orta" },
    };

    const gumusPanel: CommodityAssetPanel =
      "gumus" in COMMODITY_MOCK_PANELS
        ? (COMMODITY_MOCK_PANELS as { altin: CommodityAssetPanel; gumus: CommodityAssetPanel; petrol: CommodityAssetPanel }).gumus
        : {
            symbol: "GUMUS",
            name: "Gümüş",
            price: pulse.gumus.price,
            unit: pulse.gumus.unit,
            changePct: pulse.gumus.changePct,
            sparkline: pulse.gumus.sparkline,
            trend: pulse.gumus.changePct >= 0 ? "up" : pulse.gumus.changePct < 0 ? "down" : "flat",
            stats: { haftalik: "+2.18%", aylik: "+5.44%", destek: "27.20", direnc: "28.40" },
          };

    const dashboard = this.getDashboardPayload();
    const commodityAssets = dashboard ? filterCommodityAssets(dashboard.assets) : [];
    const signals = commodityAssets.length
      ? buildCommoditySignalsPayload(commodityAssets)
      : {
          totalActiveSignals: 18,
          bullPct: 62,
          bearPct: 38,
          marketBiasLabel: "Alış ağırlıklı",
          topAssets: screenerAssets.slice(0, 6).map((a) => ({
            symbol: a.symbol,
            name: a.name,
            activeSignals: 2,
            bullPct: a.changeDay >= 0 ? 64 : 36,
            biasLabel: a.changeDay >= 0 ? "Alış bias" : "Satış bias",
            avgConfidence: 68,
            dominantDirection: a.changeDay >= 0 ? ("BUY" as const) : ("SELL" as const),
          })),
        };

    return {
      pulse,
      regime: COMMODITY_MOCK_REGIME,
      classes: COMMODITY_MOCK_CLASSES,
      panels: {
        altin: COMMODITY_MOCK_PANELS.altin,
        gumus: gumusPanel,
        petrol: COMMODITY_MOCK_PANELS.petrol,
      },
      movers: enrichCommodityMockMovers(COMMODITY_MOCK_MOVERS),
      bottom: COMMODITY_MOCK_BOTTOM,
      signals,
      screener: COMMODITY_MOCK_SCREENER,
      treemap: { cells: buildCommodityTreemapCells(screenerAssets) },
    };
  }

  getNasdaqCategoryDashboard() {
    const screenerAssets = NASDAQ_MOCK_SCREENER.assets;
    const dashboard = this.getDashboardPayload();
    const nasdaqAssets = dashboard ? filterNasdaqAssets(dashboard.assets) : [];

    const compositePanel: NasdaqIndexPanel = {
      symbol: "COMP",
      name: "NASDAQ Composite",
      value: NASDAQ_MOCK_PULSE.composite.value,
      changePct: NASDAQ_MOCK_PULSE.composite.changePct,
      changePoint: (NASDAQ_MOCK_PULSE.composite.value * NASDAQ_MOCK_PULSE.composite.changePct) / 100,
      sparkline: NASDAQ_MOCK_PULSE.composite.sparkline,
      trend: NASDAQ_MOCK_PULSE.composite.changePct >= 0 ? "up" : "down",
      stats: { haftalik: "+2.18%", aylik: "+5.44%", destek: "16.420", direnc: "16.940" },
    };

    const signals = nasdaqAssets.length
      ? buildNasdaqSignalsPayload(nasdaqAssets)
      : {
          totalActiveSignals: 24,
          bullPct: 58,
          bearPct: 42,
          marketBiasLabel: "Alış ağırlıklı tech",
          topAssets: screenerAssets.slice(0, 6).map((a) => ({
            symbol: a.symbol,
            name: a.name,
            activeSignals: 3,
            bullPct: a.changeDay >= 0 ? 64 : 36,
            biasLabel: a.changeDay >= 0 ? "Alış bias" : "Satış bias",
            avgConfidence: 68,
            dominantDirection: a.changeDay >= 0 ? ("BUY" as const) : ("SELL" as const),
          })),
        };

    return {
      pulse: NASDAQ_MOCK_PULSE,
      regime: NASDAQ_MOCK_REGIME,
      sectors: NASDAQ_MOCK_SECTORS,
      panels: {
        ndx: NASDAQ_MOCK_PANELS.ndx,
        composite: compositePanel,
        sp500: NASDAQ_MOCK_PANELS.sp500,
      },
      movers: enrichNasdaqMockMovers(NASDAQ_MOCK_MOVERS),
      bottom: NASDAQ_MOCK_BOTTOM,
      signals,
      screener: NASDAQ_MOCK_SCREENER,
      treemap: { cells: buildNasdaqTreemapCells(screenerAssets) },
    };
  }
}
