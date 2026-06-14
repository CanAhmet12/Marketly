export type TokenomicsSupplySlice = {
  key: "circulating" | "locked" | "remaining";
  label: string;
  pct: number;
  qty: number;
};

export type TokenomicsUnlockInsight = {
  id: string;
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
  metricLabel: string;
  metricValue: string;
};

export type CryptoTokenomicsResponse = {
  symbol: string;
  coinId: string;
  name: string;
  source: "coingecko";
  updatedAt: number;
  circulatingQty: number;
  totalQty: number | null;
  maxQty: number | null;
  lockedQty: number;
  lockedPct: number;
  circulatingPct: number;
  marketCapUsd: number;
  fdvUsd: number;
  mcFdvRatio: number;
  supplyGrowth30dPct: number | null;
  unlockPressure: "low" | "medium" | "high";
  slices: TokenomicsSupplySlice[];
  insights: TokenomicsUnlockInsight[];
};
