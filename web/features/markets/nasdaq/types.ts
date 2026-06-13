/** NASDAQ Piyasa Sayfası — tip tanımları */

/* ================================
   PULSE BAR — Zone 0
   ================================ */

export type NasdaqIndexItem = {
  label: string;
  value: number;
  changePct: number;
  sparkline: number[];
};

export type NasdaqPulseMetrics = {
  ndx:        NasdaqIndexItem;   /* NASDAQ 100 */
  composite:  NasdaqIndexItem;   /* NASDAQ Composite */
  sp500:      NasdaqIndexItem;
  vix: {
    value: number;
    changePct: number;
  };
  totalVolume: string;           /* "$284B" */
  marketMood: {
    value: number;               /* 0-100 */
    label: string;               /* "Risk-On" | "Notr" | "Risk-Off" */
  };
  fedPivot: {
    value: number;
    label: string;
  };
};

/* ================================
   MARKET REGIME — Zone 1 Sol
   ================================ */

export type NasdaqRegimeType = "tech-rally" | "growth-momentum" | "karisik" | "duzeltme";

export type NasdaqRegimePayload = {
  regime:    NasdaqRegimeType;
  headline:  string;            /* "TECH RALLY" */
  summary:   string;
  ndxValue:  number;
  ndxChange: number;
  stats: {
    bigTechHareket: string;
    faizBeklentisi: string;
    buyumeMomentu:  string;
    teknik:         string;
  };
  distribution: {
    tech:    number;
    health:  number;
    other:   number;
  };
};

/* ================================
   SECTOR HEATMAP — Zone 1 Sağ
   ================================ */

export type TechHeatLevel = "hot-strong" | "hot-mild" | "neutral" | "cold-mild" | "cold-strong";

export type TechSectorItem = {
  id:         string;
  name:       string;
  changePct:  number;
  leader:     string;
  heatLevel:  TechHeatLevel;
  sparkline:  number[];
};

export type NasdaqSectorPayload = {
  sectors: TechSectorItem[];
};

/* ================================
   INDEX PANELS — Zone 2
   ================================ */

export type NasdaqIndexPanel = {
  symbol:      string;
  name:        string;
  value:       number;
  changePct:   number;
  changePoint: number;
  sparkline:   number[];
  trend:       "up" | "down" | "flat";
  stats: {
    haftalik:  string;
    aylik:     string;
    destek:    string;
    direnc:    string;
  };
};

/* ================================
   MOVERS — Zone 2 Sağ
   ================================ */

export type NasdaqMoverItem = {
  symbol:    string;
  name:      string;
  changePct: number;
  price?:    string;
  volume?:   string;
  volatility?: string;
};

export type NasdaqMoversPayload = {
  gainers: NasdaqMoverItem[];
  losers:  NasdaqMoverItem[];
  volume:  NasdaqMoverItem[];
  volatile?: NasdaqMoverItem[];
};

/* ================================
   BOTTOM STRIP — Zone 3
   ================================ */

export type NasdaqWatchItem = {
  symbol:    string;
  price:     number;
  changePct: number;
  sparkline: number[];
  trend:     "up" | "down" | "flat";
};

export type EarningsItem = {
  id:       string;
  ticker:   string;
  name:     string;
  date:     string;
  epsEst:   string;    /* "$1.84 est." */
  timing:   "AMC" | "BMO";  /* After Market Close / Before Market Open */
};

export type MacroFedItem = {
  id:      string;
  date:    string;
  title:   string;
  impact:  "high" | "medium" | "low";
};

export type NasdaqBottomStripPayload = {
  watchlist: NasdaqWatchItem[];
  earnings:  EarningsItem[];
  macroFed:  MacroFedItem[];
};

/* ================================
   SCREENER — Zone 4
   ================================ */

export type NasdaqScreenerCategory = "ai-tech" | "yariletken" | "cloud" | "biotech" | "software" | "media" | "diger";

export type NasdaqScreenerAsset = {
  rank:      number;
  symbol:    string;
  name:      string;
  sector:    NasdaqScreenerCategory;
  price:     number;
  changeDay: number;
  changeWeek: number;
  marketCap: string;
  pe:        number | null;     /* F/K orani */
  sparkline: number[];
  trend:     "up" | "down" | "flat";
};

export type NasdaqScreenerPayload = {
  assets: NasdaqScreenerAsset[];
};

/* ================================
   SECTOR TREEMAP — Zone 2b
   ================================ */

export type NasdaqTreemapCell = {
  rank: number;
  symbol: string;
  name: string;
  weightPct: number;
  changePct: number;
  marketCap: string;
  sparkline: number[];
};

export type NasdaqTreemapPayload = {
  cells: NasdaqTreemapCell[];
};

/* ================================
   SIGNAL RAIL — Zone 5
   ================================ */

export type NasdaqSignalAsset = {
  symbol: string;
  name: string;
  activeSignals: number;
  bullPct: number;
  biasLabel: string;
  avgConfidence?: number;
  dominantDirection?: "BUY" | "SELL" | "HOLD";
};

export type NasdaqSignalStripPayload = {
  totalActiveSignals: number;
  bullPct: number;
  bearPct: number;
  marketBiasLabel: string;
  topAssets: NasdaqSignalAsset[];
};
