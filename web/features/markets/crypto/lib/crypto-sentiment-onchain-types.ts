export type FearGreedPoint = {
  value: number;
  label: string;
  labelTr: string;
  timestamp: number;
};

export type OnChainHolderDistribution = {
  top10Pct: number;
  mid11_30Pct: number;
  mid31_50Pct: number;
  restPct: number;
};

export type CryptoSentimentOnchainResponse = {
  symbol: string;
  coinId: string;
  updatedAt: number;
  fearGreed: {
    current: FearGreedPoint;
    history: FearGreedPoint[];
    change7d: number | null;
  };
  onchain: {
    available: boolean;
    network: string | null;
    platform: string | null;
    holderCount: number | null;
    distribution: OnChainHolderDistribution | null;
    concentration: "low" | "medium" | "high";
    marketCapRank: number | null;
    tvlUsd: number | null;
  };
};
