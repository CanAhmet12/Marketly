export type MarketPulseReturnKey = "1h" | "24h" | "7d" | "30d" | "90d";

export type MarketPulseReturn = {
  key: MarketPulseReturnKey;
  label: string;
  changePct: number;
};

export type CryptoMarketPulseResponse = {
  symbol: string;
  pair: string;
  source: "binance" | "coingecko";
  updatedAt: number;
  currentPrice: number;
  returns: MarketPulseReturn[];
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
