/** Emtia Piyasa Sayfası — tip tanımları */

/* ================================
   PULSE BAR — Zone 0
   ================================ */

export type CommodityPulseItem = {
  symbol: string;     /* "ALTIN" */
  price: number;
  unit: string;       /* "$/oz" */
  changePct: number;
  sparkline: number[];
};

export type CommodityPulseMetrics = {
  altin:    CommodityPulseItem;
  gumus:    CommodityPulseItem;
  petrol:   CommodityPulseItem;
  dogalgaz: CommodityPulseItem;
  bakir:    CommodityPulseItem;
  bugday:   CommodityPulseItem;
  endeks: {
    value: number;
    changePct: number;
    label: string;    /* "Bloomberg CCI" */
    sparkline: number[];
  };
  trendScore: {
    value: number;    /* 0-100 */
    label: string;    /* "Guclu" | "Orta" | "Zayif" */
  };
};

/* ================================
   MARKET REGIME — Zone 1 Sol
   ================================ */

export type CommodityRegimeType = "altin-sezonu" | "enerji-lider" | "tarim-rallisi" | "karma";

export type CommodityRegimePayload = {
  regime:   CommodityRegimeType;
  headline: string;    /* "ALTIN SEZONU" */
  summary:  string;
  /** Altın fiyatı hero metrik */
  altinValue:     number;
  altinChange:    number;
  stats: {
    usdKorelasyon:    string;
    talepGorunumu:    string;
    enflasyonBekl:    string;
    trendGucu:        string;
  };
  /** Emtia sinif dagilim: metal/enerji/tarim % */
  distribution: {
    metal:  number;
    enerji: number;
    tarim:  number;
  };
};

/* ================================
   CLASS HEATMAP — Zone 1 Sağ
   ================================ */

export type CommodityHeatLevel = "hot-strong" | "hot-mild" | "neutral" | "cold-mild" | "cold-strong";

export type CommodityClassItem = {
  id:           string;
  name:         string;
  changePct:    number;
  leader:       string;     /* "ALTIN +0.31%" */
  heatLevel:    CommodityHeatLevel;
  sparkline:    number[];
};

export type CommodityClassPayload = {
  classes: CommodityClassItem[];
};

/* ================================
   ASSET PANELS — Zone 2
   ================================ */

export type CommodityAssetPanel = {
  symbol:     string;
  name:       string;
  price:      number;
  unit:       string;
  changePct:  number;
  sparkline:  number[];
  trend:      "up" | "down" | "flat";
  stats: {
    haftalik:    string;
    aylik:       string;
    destek:      string;
    direnc:      string;
  };
};

/* ================================
   MOVERS — Zone 2 Sağ
   ================================ */

export type CommodityMoverItem = {
  symbol:    string;
  name:      string;
  changePct: number;
  price?:    string;
  volume?:   string;
};

export type CommodityMoversPayload = {
  gainers: CommodityMoverItem[];
  losers:  CommodityMoverItem[];
  volume:  CommodityMoverItem[];
};

/* ================================
   BOTTOM STRIP — Zone 3
   ================================ */

export type CommodityWatchItem = {
  symbol:    string;
  price:     number;
  unit:      string;
  changePct: number;
  sparkline: number[];
  trend:     "up" | "down" | "flat";
};

export type CommodityCalendarItem = {
  id:      string;
  date:    string;
  title:   string;
  impact:  "high" | "medium" | "low";
  type:    "opec" | "report" | "harvest" | "macro";
};

export type DXYCorrelationItem = {
  symbol:      string;
  correlation: number;     /* -1.0 to +1.0 */
  label:       string;     /* "Ters Korelasyon" */
  changePct:   number;
};

export type CommodityBottomStripPayload = {
  watchlist:   CommodityWatchItem[];
  calendar:    CommodityCalendarItem[];
  correlation: DXYCorrelationItem[];
};

/* ================================
   SCREENER — Zone 4
   ================================ */

export type CommodityCategory = "degerli-metal" | "enerji" | "tarim" | "endustri";

export type CommodityScreenerAsset = {
  rank:      number;
  symbol:    string;
  name:      string;
  category:  CommodityCategory;
  price:     number;
  unit:      string;       /* "$/oz", "$/bbl", "c/bu" */
  changeDay: number;
  changeWeek: number;
  changeMonth: number;
  volume:    string;
  sparkline: number[];
  trend:     "up" | "down" | "flat";
};

export type CommodityScreenerPayload = {
  assets: CommodityScreenerAsset[];
};
