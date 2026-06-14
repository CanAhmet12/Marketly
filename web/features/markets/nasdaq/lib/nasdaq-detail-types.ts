export type NasdaqPulseReturnKey = "1h" | "24h" | "7d" | "30d" | "90d";

export type NasdaqPulseReturn = {
  key: NasdaqPulseReturnKey;
  label: string;
  changePct: number;
};

export type NasdaqMarketPulseResponse = {
  symbol: string;
  unit: string;
  source: "yahoo" | "computed";
  updatedAt: number;
  currentPrice: number;
  returns: NasdaqPulseReturn[];
  range24h: {
    high: number;
    low: number;
    positionPct: number;
  };
  volatility24hPct: number;
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

export type NasdaqFundamentalsSliceKey = "stock" | "production" | "seasonal";

export type NasdaqFundamentalsSlice = {
  key: NasdaqFundamentalsSliceKey;
  label: string;
  pct: number;
};

export type NasdaqFundamentalsInsight = {
  id: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  severity: "low" | "medium" | "high";
};

export type NasdaqFundamentalsResponse = {
  symbol: string;
  name: string;
  sector: string;
  sectorLabel: string;
  source: "reference" | "yahoo";
  updatedAt: number;
  peRatio: string;
  peSub: string;
  eps: string;
  epsSub: string;
  marketCap: string;
  marketCapSub: string;
  revenueGrowth: string;
  revenueSub: string;
  slices: NasdaqFundamentalsSlice[];
  stats: {
    fiftyTwoWeekHigh: string;
    fiftyTwoWeekLow: string;
    dividendYield: string;
    analystTarget: string;
  };
  insights: NasdaqFundamentalsInsight[];
};

export type NasdaqPeerRow = {
  rank: number;
  peerId: string;
  peerName: string;
  symbol: string;
  price: number;
  spreadPct: number;
  changePct: number;
  isSubject: boolean;
  isBenchmark: boolean;
};

export type NasdaqPeerComparisonResponse = {
  symbol: string;
  sectorLabel: string;
  source: "yahoo";
  updatedAt: number;
  peerCount: number;
  bestPrice: number;
  bestPricePeer: string;
  benchmarkPeer: string;
  avgSpreadPct: number;
  rows: NasdaqPeerRow[];
};

export type NasdaqSpreadLadderRow = {
  venueName: string;
  pair: string;
  bid: number;
  ask: number;
  spreadBps: number;
  depthPct: number;
};

export type NasdaqSpreadSessionResponse = {
  symbol: string;
  source: "yahoo";
  updatedAt: number;
  session: {
    status: "open" | "closed" | "pre";
    phase: "pre" | "regular" | "after" | "closed";
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
  rows: NasdaqSpreadLadderRow[];
};

export type NasdaqOptionRow = {
  type: "call" | "put";
  strike: number;
  iv: number;
  oi: string;
  changePct: number;
};

export type NasdaqOptionsResponse = {
  symbol: string;
  proxySymbol?: string;
  proxyNote?: string;
  source: "yahoo" | "reference";
  updatedAt: number;
  expiry: string;
  putCallRatio: number;
  impliedVolPct: number;
  totalOpenInterest: string;
  maxPain: number;
  bias: "call" | "put" | "neutral";
  biasLabel: string;
  rows: NasdaqOptionRow[];
};

export type NasdaqAnalystScorePoint = {
  label: string;
  score: number;
};

export type NasdaqAnalystSentimentResponse = {
  symbol: string;
  source: "yahoo" | "reference";
  updatedAt: number;
  priceTarget: {
    avg: string;
    upside: string;
    label: string;
  };
  earnings: {
    date: string;
    timing: "BMO" | "AMC" | "—";
    label: string;
  };
  spx: {
    value: number;
    change24hPct: number;
    label: string;
  };
  vix: {
    value: number;
    change24hPct: number;
    label: string;
  };
  correlation: {
    spxCorrelation: number;
    label: string;
    strength: "weak" | "moderate" | "strong";
  };
  sentimentScore: {
    value: number;
    label: string;
  };
  history: NasdaqAnalystScorePoint[];
};
