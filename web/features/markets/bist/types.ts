/** BIST Piyasa Sayfası — tip tanımları */

/* ================================
   PULSE BAR — Zone 0
   ================================ */

export type BistIndexItem = {
  label: string;
  value: number;
  changePercent: number;
  sparkline: number[];
};

export type BistPulseMetrics = {
  bist100:    BistIndexItem;
  bist30:     BistIndexItem;
  bistBanka:  BistIndexItem;
  bistSinai:  BistIndexItem;
  /** "124.7 MLRD TL" */
  toplamHacim: string;
  yabancıOran: {
    value: number;   /* 36.42 */
    change: number;  /* +0.78 puan */
    label: string;   /* "Günlük" */
  };
  piyasaDurumu: {
    value: number;   /* 0–100 */
    label: string;   /* "Yükseliş" | "Satış" | "Yatay" */
  };
};

/* ================================
   MARKET STATE — Zone 1 Sol
   ================================ */

export type BistTrend = "bull" | "bear" | "yatay";

export type BistMarketStatePayload = {
  trend: BistTrend;
  /** "YÜKSELİŞ PİYASASI" */
  headline: string;
  summary: string;
  /** BIST 100 anlık değer (hero metrik) */
  bist100Value: number;
  bist100Change: number;
  stats: {
    volatilite: string;
    yabancıNetAlım: string;
    teknikGorunum: string;
    momentum: string;
  };
  /** Sektör dağılımı için bar: mali, sanayi, diğer % */
  sectorDistribution: {
    mali: number;
    sanayi: number;
    diger: number;
  };
};

/* ================================
   SECTOR PERFORMANCE — Zone 1 Sağ
   ================================ */

export type BistHeatLevel = "hot-strong" | "hot-mild" | "neutral" | "cold-mild" | "cold-strong";

export type BistSectorItem = {
  id: string;
  name: string;
  changePercent: number;
  leader: string;  /* "GARAN +2.1%" */
  heatLevel: BistHeatLevel;
  sparkline: number[];
};

export type BistSectorPayload = {
  sectors: BistSectorItem[];
};

/* ================================
   INDEX PANELS — Zone 2
   ================================ */

export type BistIndexPanel = {
  symbol: "BIST100" | "BIST30" | "BISTBANK";
  name: string;
  value: number;
  changePercent: number;
  changeDay: number;
  sparkline: number[];
  trend: "up" | "down" | "flat";
  stats: {
    marketCap: string;
    volume: string;
    highDay: string;
    lowDay: string;
  };
};

/* ================================
   MOVERS — Zone 2 Sağ
   ================================ */

export type BistMoverItem = {
  symbol: string;
  name: string;
  change: number;
  price?: string;
  volume?: string;
  volatility?: string;
};

export type BistMoversPayload = {
  gainers:  BistMoverItem[];
  losers:   BistMoverItem[];
  volume:   BistMoverItem[];
  volatile?: BistMoverItem[];
};

/* ================================
   BOTTOM STRIP — Zone 3
   ================================ */

export type BistWatchlistItem = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sparkline: number[];
  trend: "up" | "down" | "flat";
};

export type BistGundemItem = {
  id: string;
  time: string;
  title: string;
  impact: "high" | "medium" | "low";
  country: string;
};

export type BistFxItem = {
  symbol: string;
  price: number;
  changePercent: number;
  trend: "up" | "down" | "flat";
};

export type BistBottomStripPayload = {
  watchlist: BistWatchlistItem[];
  gundem:    BistGundemItem[];
  fx:        BistFxItem[];
};

/* ================================
   SCREENER — Zone 4
   ================================ */

export type BistScreenerAsset = {
  rank: number;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changeDay: number;
  changeWeek: number;
  /** "2.4 MLRD" */
  volume: string;
  /** "148 MLRD" */
  marketCap: string;
  sparkline: number[];
  trend: "up" | "down" | "flat";
};

export type BistScreenerPayload = {
  assets: BistScreenerAsset[];
};

export type BistScreenerCategory =
  | "bankacilik"
  | "holding"
  | "sanayi"
  | "ulasim"
  | "enerji"
  | "perakende"
  | "insaat"
  | "teknoloji"
  | "diger";

/* ================================
   SECTOR TREEMAP — Zone 2b
   ================================ */

export type BistTreemapCell = {
  rank: number;
  symbol: string;
  name: string;
  weightPct: number;
  changePct: number;
  marketCap: string;
  sparkline: number[];
};

export type BistTreemapPayload = {
  cells: BistTreemapCell[];
};

/* ================================
   SIGNAL RAIL — Zone 5
   ================================ */

export type BistSignalAsset = {
  symbol: string;
  name: string;
  activeSignals: number;
  bullPct: number;
  biasLabel: string;
  avgConfidence?: number;
  dominantDirection?: "BUY" | "SELL" | "HOLD";
};

export type BistSignalStripPayload = {
  totalActiveSignals: number;
  bullPct: number;
  bearPct: number;
  marketBiasLabel: string;
  topAssets: BistSignalAsset[];
};
