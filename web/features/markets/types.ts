/** Mobil MarketsScreen + masaüstü endeks / takip sekmesi */
export type MarketAssetCategory = "crypto" | "stocks" | "forex" | "commodity" | "index";

export type MarketSegmentId = "all" | "crypto" | "stocks" | "forex" | "commodity" | "index" | "watchlist";

/** İkincil görünüm: sıralama / yoğunluk (sekme değil) */
export type MarketLensId =
  | "none"
  | "favorites"
  | "gainers"
  | "losers"
  | "active"
  | "volume"
  | "volatile"
  | "signals"
  | "watchlist";

/** @deprecated Birleşik id — yerine MarketSegmentId + MarketLensId */
export type MarketQuickFilterId = MarketSegmentId | MarketLensId;

export type MarketAssetView = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  volume: string;
  trend: "up" | "down" | "flat";
  category: MarketAssetCategory;
  marketCapLabel: string;
  sparkline: number[];
  /** Mock — aktif sinyal sayısı */
  signal_active_count: number;
  /** Mock — bullish payı % */
  signal_bull_pct: number;
  /** Mock — en çok görünen analist */
  signal_top_analyst: string | null;
};

export type MarketHeroMover = { symbol: string; change_percent: number; name: string };

export type MarketHeroPayload = {
  headlineMood: "risk_on" | "mixed" | "risk_off";
  moodLabel: string;
  moodDetail: string;
  /** Rejim özeti — kısa komuta satırı */
  regimeSummary: string;
  btcDominance: string;
  fearGreed: { value: number; label: string };
  openMarketsLabel: string;
  topGainers: MarketHeroMover[];
  topLosers: MarketHeroMover[];
  /** Özet: toplam hacim etiketi (mock) */
  totalVolumeLabel: string;
  /** Yükselen / düşen sayısı */
  advancers: number;
  decliners: number;
  /** Fiyat hareket σ bandı */
  volatilityBand: "low" | "medium" | "high";
  volatilityLabel: string;
  /** Tüm varlıklarda aktif sinyal toplamı */
  signalActivityCount: number;
  /** Tahmini aktif analist (mock türev) */
  activeAnalystCount: number;
  /** En güçlü tema / sektör özeti */
  strongestAssetTheme: string;
  /** Sentiment + sinyal bias birleşimi */
  sentimentPulseLabel: string;
  updatedAt: string;
};

export type MarketDetailExtras = {
  support: number;
  resistance: number;
  sentimentScore: number;
  sentimentLabel: string;
  relatedSignalsCount: number;
};
