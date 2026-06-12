/** Forex Piyasa Sayfası — tip tanımları */

/* ================================
   PULSE BAR — Zone 0
   ================================ */

export type ForexPairItem = {
  pair: string;         /* "EUR/USD" */
  rate: number;         /* 1.0847 */
  changePct: number;    /* +0.23 */
  sparkline: number[];
};

export type ForexSession = {
  name: "Tokyo" | "London" | "NewYork";
  label: string;
  status: "active" | "soon" | "closed";
  time: string;  /* "08:00–17:00 UTC" */
};

export type ForexPulseMetrics = {
  eurusd:  ForexPairItem;
  gbpusd:  ForexPairItem;
  usdtry:  ForexPairItem;
  usdjpy:  ForexPairItem;
  dxy: {
    value: number;
    changePct: number;
    sparkline: number[];
  };
  sessions: ForexSession[];
  volatility: {
    value: number;   /* 0–100 */
    label: string;   /* "Dusuk" | "Orta" | "Yuksek" */
  };
};

/* ================================
   MARKET REGIME — Zone 1 Sol
   ================================ */

export type ForexRegimeType = "usd-dominant" | "risk-on" | "risk-off" | "range";

export type ForexMarketRegimePayload = {
  regime: ForexRegimeType;
  /** "USD BASKIN" | "RISK-ON" | "RISK-OFF" | "YATAY" */
  headline: string;
  summary: string;
  /** DXY endeks değeri */
  dxyValue: number;
  dxyChange: number;
  stats: {
    fedTutumu: string;
    riskIstahi: string;
    carryTrade: string;
    trendGucu: string;
  };
  /** Para birimi dağılım: safe/risky/em % */
  distribution: {
    safe: number;   /* USD, JPY, CHF */
    risky: number;  /* AUD, NZD, CAD, GBP */
    em: number;     /* TRY, MXN vs */
  };
};

/* ================================
   CURRENCY HEATMAP — Zone 1 Sağ
   ================================ */

export type CurrencyHeatLevel = "strong" | "mild-up" | "neutral" | "mild-down" | "weak";

export type CurrencyStrengthItem = {
  code: string;     /* "USD" */
  name: string;     /* "Amerikan Dolari" */
  changePct: number;
  heatLevel: CurrencyHeatLevel;
  sparkline: number[];
};

export type ForexCurrencyHeatmapPayload = {
  currencies: CurrencyStrengthItem[];
};

/* ================================
   PAIR PANELS — Zone 2
   ================================ */

export type ForexPairPanel = {
  symbol: string;   /* "EURUSD" */
  pair: string;     /* "EUR/USD" */
  base: string;     /* "EUR" */
  quote: string;    /* "USD" */
  rate: number;
  changePct: number;
  bid: number;
  ask: number;
  spread: number;   /* pip */
  sparkline: number[];
  trend: "up" | "down" | "flat";
  stats: {
    dayHigh: string;
    dayLow: string;
    pipRange: string;
    weeklyChange: string;
  };
};

/* ================================
   MOVERS — Zone 2 Sağ
   ================================ */

export type ForexMoverItem = {
  pair: string;
  symbol: string;
  changePct: number;
  pip?: number;
  volume?: string;
  volatility?: string;
};

export type ForexMoversPayload = {
  gainers: ForexMoverItem[];
  losers: ForexMoverItem[];
  /** Hacim liderleri — intel deck */
  volume: ForexMoverItem[];
  /** En volatil — intel deck */
  volatile: ForexMoverItem[];
  /** @deprecated Intel deck kullan; geriye uyumluluk */
  active: ForexMoverItem[];
};

/* ================================
   BOTTOM STRIP — Zone 3
   ================================ */

export type ForexWatchItem = {
  pair: string;
  rate: number;
  changePct: number;
  sparkline: number[];
  trend: "up" | "down" | "flat";
};

export type CentralBankEvent = {
  id: string;
  time: string;
  bank: string;     /* "Fed", "ECB", "TCMB" */
  title: string;
  impact: "high" | "medium" | "low";
  country: string;  /* "US", "EU", "TR" */
};

export type CommodityItem = {
  symbol: string;   /* "ALTIN/USD" */
  price: number;
  changePct: number;
  trend: "up" | "down" | "flat";
  unit: string;     /* "$/oz", "$/bbl", "" */
};

export type ForexBottomStripPayload = {
  watchlist:    ForexWatchItem[];
  centralBanks: CentralBankEvent[];
  commodities:  CommodityItem[];
};

/* ================================
   FX SCREENER — Zone 4
   ================================ */

export type ForexScreenerAsset = {
  rank: number;
  symbol: string;
  pair: string;
  category: "major" | "minor" | "exotic";
  bid: number;
  ask: number;
  spread: number;
  pipChange: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  session: "LDN" | "NY" | "TKY" | "ALL" | "CLOSED";
  sparkline: number[];
  trend: "up" | "down" | "flat";
  volume?: string;
};

export type ForexScreenerPayload = {
  assets: ForexScreenerAsset[];
};

/* ================================
   PAIR TREEMAP — Zone 2b
   ================================ */

export type ForexTreemapCell = {
  rank: number;
  symbol: string;
  pair: string;
  weightPct: number;
  changePct: number;
  volume: string;
  sparkline: number[];
};

export type ForexTreemapPayload = {
  cells: ForexTreemapCell[];
};

/* ================================
   SIGNAL RAIL — Zone 5
   ================================ */

export type ForexSignalAsset = {
  symbol: string;
  pair: string;
  activeSignals: number;
  bullPct: number;
  biasLabel: string;
  avgConfidence?: number;
  dominantDirection?: "BUY" | "SELL" | "HOLD";
};

export type ForexSignalStripPayload = {
  totalActiveSignals: number;
  bullPct: number;
  bearPct: number;
  marketBiasLabel: string;
  topAssets: ForexSignalAsset[];
};
