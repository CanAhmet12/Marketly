export type BistPulseReturnKey = "1h" | "24h" | "7d" | "30d" | "90d";

export type BistPulseReturn = {
  key: BistPulseReturnKey;
  label: string;
  changePct: number;
};

export type BistMarketPulseResponse = {
  symbol: string;
  unit: string;
  source: "yahoo" | "computed";
  updatedAt: number;
  currentPrice: number;
  returns: BistPulseReturn[];
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
  xu100Correlation: number;
  correlationLabel: string;
  levels: {
    support: number;
    resistance: number;
    pivot: number;
  };
};

export type BistFundamentalsSliceKey = "stock" | "production" | "seasonal";

export type BistFundamentalsSlice = {
  key: BistFundamentalsSliceKey;
  label: string;
  pct: number;
};

export type BistFundamentalsInsight = {
  id: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  severity: "low" | "medium" | "high";
};

export type BistFundamentalsResponse = {
  symbol: string;
  name: string;
  sector: string;
  sectorLabel: string;
  source: "reference" | "yahoo";
  updatedAt: number;
  peRatio: string;
  peSub: string;
  pbRatio: string;
  pbSub: string;
  marketCap: string;
  marketCapSub: string;
  revenueGrowth: string;
  revenueSub: string;
  slices: BistFundamentalsSlice[];
  stats: {
    fiftyTwoWeekHigh: string;
    fiftyTwoWeekLow: string;
    dividendYield: string;
    analystTarget: string;
  };
  insights: BistFundamentalsInsight[];
};

export type BistPeerRow = {
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

export type BistPeerComparisonResponse = {
  symbol: string;
  sectorLabel: string;
  source: "yahoo";
  updatedAt: number;
  peerCount: number;
  bestPrice: number;
  bestPricePeer: string;
  benchmarkPeer: string;
  avgSpreadPct: number;
  rows: BistPeerRow[];
};

export type BistSpreadLadderRow = {
  venueName: string;
  pair: string;
  spreadBps: number;
  depthPct: number;
};

export type BistSpreadSessionResponse = {
  symbol: string;
  source: "yahoo";
  updatedAt: number;
  session: {
    status: "open" | "closed" | "pre";
    phase: "pre" | "regular" | "closing" | "closed";
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
  rows: BistSpreadLadderRow[];
};

export type BistVolumeForeignResponse = {
  symbol: string;
  source: "yahoo" | "computed";
  updatedAt: number;
  volume: {
    dailyLabel: string;
    avg20dLabel: string;
    changePct: number;
    turnoverLabel: string;
  };
  foreign: {
    ratioPct: number;
    changePp: number;
    label: string;
    flowLabel: string;
  };
  rows: { period: string; volumeLabel: string; foreignPct: number }[];
};

export type BistMacroFxResponse = {
  symbol: string;
  source: "yahoo";
  updatedAt: number;
  macroScore: { value: number; label: string };
  usdTry: { value: number; change24hPct: number; label: string };
  eurTry: { value: number; change24hPct: number; label: string };
  sensitivity: { fxBeta: number; label: string };
  history: { label: string; score: number }[];
};
