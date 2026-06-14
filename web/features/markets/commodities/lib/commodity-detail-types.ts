import type { CommodityCategory } from "@/features/markets/commodities/types";

export type CommodityPulseReturnKey = "1h" | "24h" | "7d" | "30d" | "90d";

export type CommodityPulseReturn = {
  key: CommodityPulseReturnKey;
  label: string;
  changePct: number;
};

export type CommodityMarketPulseResponse = {
  symbol: string;
  unit: string;
  source: "yahoo" | "computed";
  updatedAt: number;
  currentPrice: number;
  returns: CommodityPulseReturn[];
  range24h: {
    high: number;
    low: number;
    positionPct: number;
  };
  volatility24hPct: number;
  levels: {
    support: number;
    resistance: number;
    pivot: number;
  };
};

export type CommodityFundamentalsSliceKey = "stock" | "production" | "seasonal";

export type CommodityFundamentalsSlice = {
  key: CommodityFundamentalsSliceKey;
  label: string;
  pct: number;
};

export type CommodityFundamentalsInsight = {
  id: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  severity: "low" | "medium" | "high";
};

export type CommodityFundamentalsResponse = {
  symbol: string;
  name: string;
  category: CommodityCategory;
  unit: string;
  source: "reference";
  updatedAt: number;
  supplyStock: string;
  supplyStockSub: string;
  seasonalWindow: string;
  seasonalSub: string;
  capacityUtilPct: number;
  capacityLabel: string;
  supplyPressure: "low" | "medium" | "high";
  inventoryChange30dPct: number | null;
  slices: CommodityFundamentalsSlice[];
  stats: {
    weeklyDraw: string;
    daysCover: string;
    productionTrend: string;
    harvestWindow: string;
  };
  insights: CommodityFundamentalsInsight[];
};

export type CommodityVenueRow = {
  rank: number;
  venueId: string;
  venueName: string;
  pair: string;
  price: number;
  spreadPct: number;
  priceDeltaPct: number;
  isBestPrice: boolean;
  isBenchmark: boolean;
};

export type CommodityVenueComparisonResponse = {
  symbol: string;
  unit: string;
  source: "yahoo";
  updatedAt: number;
  venueCount: number;
  bestPrice: number;
  bestPriceVenue: string;
  benchmarkVenue: string;
  avgSpreadPct: number;
  rows: CommodityVenueRow[];
};

export type CommodityMacroScorePoint = {
  label: string;
  score: number;
};

export type CommodityMacroSentimentResponse = {
  symbol: string;
  source: "yahoo";
  updatedAt: number;
  dxy: {
    value: number;
    change24hPct: number;
    label: string;
  };
  riskAppetite: {
    vix: number;
    change24hPct: number;
    label: string;
  };
  inflationProxy: {
    value: number;
    label: string;
  };
  correlation: {
    dxyCorrelation: number;
    label: string;
    strength: "weak" | "moderate" | "strong";
  };
  macroScore: {
    value: number;
    label: string;
  };
  history: CommodityMacroScorePoint[];
};

export type CommoditySpreadLadderRow = {
  venueName: string;
  pair: string;
  bid: number;
  ask: number;
  spreadBps: number;
  depthPct: number;
};

export type CommoditySpreadSessionResponse = {
  symbol: string;
  unit: string;
  source: "yahoo";
  updatedAt: number;
  session: {
    status: "open" | "closed" | "pre";
    label: string;
    venue: string;
    nextEvent: string;
    timezone: string;
  };
  spread: {
    mid: number;
    spreadBps: number;
    bestBid: number;
    bestAsk: number;
    spreadLabel: string;
  };
  benchmark: {
    name: string;
    price: number;
    deltaPct: number;
  };
  rows: CommoditySpreadLadderRow[];
};

export type CommodityDerivativesResponse = {
  symbol: string;
  unit: string;
  source: "yahoo";
  updatedAt: number;
  contract: string;
  markPrice: number;
  change24hPct: number;
  basisPct: number;
  contangoPct: number;
  rollYieldAnnualPct: number;
  openInterestLabel: string;
  bias: "long" | "short" | "neutral";
  biasLabel: string;
};
