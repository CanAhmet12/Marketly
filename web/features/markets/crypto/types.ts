/** Phase 1 — Kripto sayfası tipleri */

export type CryptoRegime = "bull" | "chop" | "bear";

export type CryptoPulseMetrics = {
  btc: {
    price: number;
    change24h: number;
    /** Formatlanmış market cap: "$1.32T" */
    marketCapLabel: string;
  };
  eth: {
    price: number;
    change24h: number;
    marketCapLabel: string;
  };
  /** "54.3%" */
  btcDominance: string;
  /** "14.8%" */
  ethDominance: string;
  /** "0.0523" */
  ethBtcRatio: string;
  /** "$2.48T" */
  totalMarketCap: string;
  totalMarketCapChange24h: number;
  /** "$98.4B" */
  volume24h: string;
  fearGreed: {
    value: number;
    /** "Greed" | "Fear" | "Extreme Greed" | "Extreme Fear" | "Neutral" */
    label: string;
  };
  /** 0–100; >75 = altcoin season */
  altcoinSeasonIndex: number;
};

export type CryptoRegimePayload = {
  regime: CryptoRegime;
  /** "BTC likiditeyi topluyor; altcoin hacmi seçici kalıyor." */
  summary: string;
  volatilityBand: "low" | "medium" | "high";
  volatilityLabel: string;
  /** 0–100, riskOn trend için yüksek */
  riskBias: number;
  riskBiasLabel: string;
  /** "Stablecoin çıkışı süüyor" veya "Stablecoin girişi" */
  stablecoinFlowLabel: string;
  btcDominanceNumeric: number;
  ethDominanceNumeric: number;
};

export type CryptoAnchorAsset = {
  symbol: "BTC" | "ETH";
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: string;
  volume24h: string;
  /** Genişletilmiş: 7 günlük günlük kapanış değerleri */
  sparkline7d: number[];
  trend: "up" | "down" | "flat";
};

export type CryptoDashboardPhase1 = {
  pulse: CryptoPulseMetrics;
  regime: CryptoRegimePayload;
  btc: CryptoAnchorAsset;
  eth: CryptoAnchorAsset;
};

/* ================================
   MOVERS — Zone 2
   ================================ */

export type CryptoMoverItem = {
  symbol: string;
  change: number;
  price?: string;
  volume?: string;
  volatility?: string;
};

export type CryptoMoversPayload = {
  gainers:  CryptoMoverItem[];
  losers:   CryptoMoverItem[];
  volume:   CryptoMoverItem[];
  volatile: CryptoMoverItem[];
};

/* ================================
   SEGMENTS — Zone 3
   ================================ */

export type CryptoHeatLevel = "hot-strong" | "hot-mild" | "neutral" | "cold-mild" | "cold-strong";

export type CryptoSegmentItem = {
  id: string;
  name: string;
  change24h: number;
  leader: string;
  heatLevel: CryptoHeatLevel;
  barPct: number;
};

export type CryptoSegmentsPayload = {
  segments: CryptoSegmentItem[];
};

/* ================================
   SIGNAL STRIP — Zone 4
   ================================ */

export type CryptoSignalAsset = {
  symbol: string;
  activeSignals: number;
  bullPct: number;
  biasLabel: string;
};

export type CryptoSignalStripPayload = {
  totalActiveSignals: number;
  bullPct: number;
  bearPct: number;
  marketBiasLabel: string;
  topAssets: CryptoSignalAsset[];
};

/* ================================
   SCREENER — Zone 5
   ================================ */

export type CryptoScreenerAsset = {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: string;
  volume24h: string;
  sparkline: number[];
  trend: "up" | "down" | "flat";
};

export type CryptoScreenerPayload = {
  assets: CryptoScreenerAsset[];
};

/* ================================
   BOTTOM STRIP — Zone 6
   ================================ */

export type CryptoWatchlistItem = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
  trend: "up" | "down" | "flat";
};

export type CryptoNewsItem = {
  id: string;
  title: string;
  timeAgo: string;
  tag: string;
};

export type CryptoCalendarItem = {
  id: string;
  title: string;
  date: string;
  type: "unlock" | "etf" | "macro" | "fork" | "listing";
};

export type CryptoBottomStripPayload = {
  watchlist: CryptoWatchlistItem[];
  news: CryptoNewsItem[];
  calendar: CryptoCalendarItem[];
};
