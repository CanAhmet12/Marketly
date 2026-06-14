export type ForexPulseReturnKey = "1h" | "24h" | "7d" | "30d" | "90d";

export type ForexPulseReturn = {
  key: ForexPulseReturnKey;
  label: string;
  changePct: number;
};

export type ForexMarketPulseResponse = {
  symbol: string;
  pair: string;
  unit: string;
  source: "yahoo" | "computed";
  updatedAt: number;
  currentPrice: number;
  returns: ForexPulseReturn[];
  range24h: {
    high: number;
    low: number;
    positionPct: number;
  };
  volatility24hPct: number;
  pipRange24h: number;
  beta: number;
  betaLabel: string;
  benchmarkSymbol: string;
  benchmarkChange30dPct: number;
  levels: {
    support: number;
    resistance: number;
    pivot: number;
  };
};

export type ForexMacroSliceKey = "policy" | "carry" | "macro";

export type ForexMacroSlice = {
  key: ForexMacroSliceKey;
  label: string;
  pct: number;
};

export type ForexMacroInsight = {
  id: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  severity: "low" | "medium" | "high";
};

export type ForexMacroRatesResponse = {
  symbol: string;
  pair: string;
  categoryLabel: string;
  source: "reference" | "yahoo";
  updatedAt: number;
  rateDiff: string;
  rateDiffSub: string;
  baseRate: string;
  baseRateSub: string;
  quoteRate: string;
  quoteRateSub: string;
  carryScore: string;
  carrySub: string;
  slices: ForexMacroSlice[];
  stats: {
    dxy30d: string;
    policyBias: string;
    carryBias: string;
    macroScore: string;
  };
  insights: ForexMacroInsight[];
};

export type ForexCrossPairRow = {
  rank: number;
  pairId: string;
  pairName: string;
  symbol: string;
  pair: string;
  price: number;
  spreadPct: number;
  changePct: number;
  isSubject: boolean;
  isBenchmark: boolean;
};

export type ForexCrossPairResponse = {
  symbol: string;
  pair: string;
  categoryLabel: string;
  source: "yahoo";
  updatedAt: number;
  pairCount: number;
  bestPrice: number;
  bestPricePair: string;
  benchmarkPair: string;
  avgSpreadPct: number;
  rows: ForexCrossPairRow[];
};

export type ForexSpreadLadderRow = {
  venueName: string;
  pair: string;
  bid: number;
  ask: number;
  spreadBps: number;
  spreadPips: number;
  depthPct: number;
};

export type ForexSpreadSessionResponse = {
  symbol: string;
  pair: string;
  source: "yahoo" | "computed";
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
    spreadPips: number;
    bestBid: number;
    bestAsk: number;
    spreadLabel: string;
  };
  benchmark: {
    name: string;
    price: number;
    deltaPct: number;
  };
  rows: ForexSpreadLadderRow[];
};

export type ForexCarrySwapResponse = {
  symbol: string;
  pair: string;
  source: "reference" | "yahoo";
  updatedAt: number;
  longSwapPips: number;
  shortSwapPips: number;
  swapLongLabel: string;
  swapShortLabel: string;
  rateDiffBps: number;
  forwardPremiumPct: number;
  rollCostAnnualPct: number;
  forwardBias: string;
  baseBank: string;
  quoteBank: string;
  bias: "long" | "short" | "neutral";
  biasLabel: string;
};

export type ForexMacroScorePoint = {
  label: string;
  score: number;
};

export type ForexMacroSentimentResponse = {
  symbol: string;
  pair: string;
  source: "yahoo" | "computed";
  updatedAt: number;
  dxy: {
    value: number;
    change24hPct: number;
    label: string;
  };
  riskRegime: {
    vix: number;
    change24hPct: number;
    label: string;
  };
  correlation: {
    dxySensitivity: number;
    label: string;
    strength: "weak" | "moderate" | "strong";
  };
  macroScore: {
    value: number;
    label: string;
  };
  history: ForexMacroScorePoint[];
};
