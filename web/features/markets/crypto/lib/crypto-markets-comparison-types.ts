export type MarketsComparisonTrust = "green" | "yellow" | "red" | "unknown";

export type MarketsComparisonRow = {
  rank: number;
  exchangeId: string;
  exchangeName: string;
  pair: string;
  price: number;
  volumeUsd: number;
  spreadPct: number;
  trustScore: MarketsComparisonTrust;
  priceDeltaPct: number;
  tradeUrl: string | null;
  isTopVolume: boolean;
  isBestPrice: boolean;
};

export type CryptoMarketsComparisonResponse = {
  symbol: string;
  coinId: string;
  source: "coingecko";
  updatedAt: number;
  exchangeCount: number;
  bestPrice: number;
  bestPriceExchange: string;
  topVolumeExchange: string;
  avgSpreadPct: number;
  rows: MarketsComparisonRow[];
};
