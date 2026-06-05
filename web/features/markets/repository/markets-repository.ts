import type { MarketAssetView, MarketDetailExtras, MarketHeroPayload } from "@/features/markets/types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type {
  MarketsCommunityNetworkBundle,
  MarketsIntelligenceSurface,
  WatchlistMarketsContext,
} from "@/features/markets/types/markets-intelligence";
import type {
  PortfolioIntelligenceBundle,
  WatchlistIntelligenceBundle,
} from "@/features/markets/types/personal-market-intelligence";
import type {
  EconomicCalendarIntelligenceBundle,
  MarketNewsroomBundle,
} from "@/features/markets/types/news-calendar-intelligence";
import type {
  CryptoDashboardPhase1,
  CryptoMoversPayload,
  CryptoSegmentsPayload,
  CryptoSignalStripPayload,
  CryptoScreenerPayload,
  CryptoBottomStripPayload,
} from "@/features/markets/crypto/types";
import type {
  BistPulseMetrics,
  BistMarketStatePayload,
  BistSectorPayload,
  BistIndexPanel,
  BistMoversPayload,
  BistBottomStripPayload,
  BistScreenerPayload,
} from "@/features/markets/bist/types";
import type {
  ForexPulseMetrics,
  ForexMarketRegimePayload,
  ForexCurrencyHeatmapPayload,
  ForexPairPanel,
  ForexMoversPayload,
  ForexBottomStripPayload,
  ForexScreenerPayload,
} from "@/features/markets/forex/types";
import type {
  CommodityPulseMetrics,
  CommodityRegimePayload,
  CommodityClassPayload,
  CommodityAssetPanel,
  CommodityMoversPayload,
  CommodityBottomStripPayload,
  CommodityScreenerPayload,
} from "@/features/markets/commodities/types";
import type {
  NasdaqPulseMetrics,
  NasdaqRegimePayload,
  NasdaqSectorPayload,
  NasdaqIndexPanel,
  NasdaqMoversPayload,
  NasdaqBottomStripPayload,
  NasdaqScreenerPayload,
} from "@/features/markets/nasdaq/types";

export type EconomicCalendarRow = {
  id: string;
  at: string;
  country: string;
  title: string;
  impact: 1 | 2 | 3;
  /** Etkilenen semboller — haber / makro bağlamı */
  affectedSymbols?: readonly string[];
  /** Kısa volatilite bağlamı */
  volatilityHint?: string;
};

export type MarketNewsRow = {
  id: string;
  symbol: string;
  headline: string;
  source: string;
  minutesAgo: number;
  impactTier?: 1 | 2 | 3;
  affectedSymbols?: readonly string[];
  volatilityHint?: string;
};

export type PortfolioStripRow = { label: string; value: string; hint?: string };

export type MarketPulseChip = { label: string; href: string };

export type MarketsHomePayload = {
  assets: MarketAssetView[];
  hero: MarketHeroPayload;
  intelligence: MarketsIntelligenceSurface;
};

/** Kripto kategori sayfası için tam veri paketi */
export type CryptoCategoryDashboard = {
  phase1:     CryptoDashboardPhase1;
  movers:     CryptoMoversPayload;
  segments:   CryptoSegmentsPayload;
  signals:    CryptoSignalStripPayload;
  screener:   CryptoScreenerPayload;
  bottomStrip: CryptoBottomStripPayload;
};

/** NASDAQ kategori sayfası için tam veri paketi */
export type NasdaqCategoryDashboard = {
  pulse:   NasdaqPulseMetrics;
  regime:  NasdaqRegimePayload;
  sectors: NasdaqSectorPayload;
  panels:  { ndx: NasdaqIndexPanel; sp500: NasdaqIndexPanel };
  movers:  NasdaqMoversPayload;
  bottom:  NasdaqBottomStripPayload;
  screener: NasdaqScreenerPayload;
};

/** Emtia kategori sayfası için tam veri paketi */
export type CommoditiesCategoryDashboard = {
  pulse:   CommodityPulseMetrics;
  regime:  CommodityRegimePayload;
  classes: CommodityClassPayload;
  panels:  { altin: CommodityAssetPanel; petrol: CommodityAssetPanel };
  movers:  CommodityMoversPayload;
  bottom:  CommodityBottomStripPayload;
  screener: CommodityScreenerPayload;
};

/** Forex kategori sayfası için tam veri paketi */
export type ForexCategoryDashboard = {
  pulse:      ForexPulseMetrics;
  regime:     ForexMarketRegimePayload;
  currencies: ForexCurrencyHeatmapPayload;
  panels:     { eurusd: ForexPairPanel; gbpusd: ForexPairPanel };
  movers:     ForexMoversPayload;
  bottom:     ForexBottomStripPayload;
  screener:   ForexScreenerPayload;
};

/** BIST kategori sayfası için tam veri paketi */
export type BistCategoryDashboard = {
  pulse:       BistPulseMetrics;
  marketState: BistMarketStatePayload;
  sectors:     BistSectorPayload;
  panels:      { bist100: BistIndexPanel; bist30: BistIndexPanel };
  movers:      BistMoversPayload;
  bottom:      BistBottomStripPayload;
  screener:    BistScreenerPayload;
};

export type MarketsRepository = {
  /** Mock: ilk ziyaret watchlist sembolleri; prod: kullanıcı watchlist snapshot veya undefined */
  getWatchlistSeed(): readonly string[] | undefined;
  getDashboardPayload(): MarketsHomePayload | null;
  /** Takip / sabit semboller üzerinden kompakt bağlam */
  getWatchlistMarketsContext(watchedSymbols: readonly string[], pinnedSymbols: readonly string[]): WatchlistMarketsContext;
  /** Piyasa tartışma ağı — dashboard ile aynı mock üretimi; canlıda boş güvenli */
  getMarketCommunityNetwork(): MarketsCommunityNetworkBundle;
  /** Takip listesi komuta merkezi — mock üretim; canlıda boş + onboarding */
  getWatchlistIntelligenceBundle(
    watchedSymbols: readonly string[],
    pinnedSymbols: readonly string[],
  ): WatchlistIntelligenceBundle;
  /** Kağıt portföy istihbaratı — mock; canlıda boş güvenli */
  getPortfolioIntelligenceBundle(): PortfolioIntelligenceBundle;
  getEconomicCalendar(): EconomicCalendarRow[];
  /** Haber odası — sinyal akışı + izleme/portföy kesişimi (mock üretim; canlıda boş güvenli) */
  getMarketNewsroomBundle(
    watchedSymbols: readonly string[],
    portfolioSymbols: readonly string[],
  ): MarketNewsroomBundle;
  /** Makro takvim istihbaratı — mock üretim; canlıda boş güvenli */
  getEconomicCalendarIntelligenceBundle(
    watchedSymbols: readonly string[],
    portfolioSymbols: readonly string[],
  ): EconomicCalendarIntelligenceBundle;
  getMarketNewsStrip(): MarketNewsRow[];
  getPortfolioStrip(): PortfolioStripRow[];
  getMarketPulseChips(): MarketPulseChip[];
  getAssetIntelligenceBundle(decodedSymbol: string): AssetIntelligenceBundle | null;
  getMarketDetailExtras(price: number, changePercent: number): MarketDetailExtras;
  /** Kripto kategori sayfası — mock: tam veri; prod: null */
  getCryptoCategoryDashboard(): CryptoCategoryDashboard | null;
  /** BIST kategori sayfası — mock: tam veri; prod: null */
  getBistCategoryDashboard(): BistCategoryDashboard | null;
  /** Forex kategori sayfası — mock: tam veri; prod: null */
  getForexCategoryDashboard(): ForexCategoryDashboard | null;
  /** Emtia kategori sayfası — mock: tam veri; prod: null */
  getCommoditiesCategoryDashboard(): CommoditiesCategoryDashboard | null;
  /** NASDAQ kategori sayfası — mock: tam veri; prod: null */
  getNasdaqCategoryDashboard(): NasdaqCategoryDashboard | null;
};
