export type LiquidityLevel = {
  price: number;
  qty: number;
  notional: number;
  cumQty: number;
  cumNotional: number;
};

export type LiquidityTrade = {
  id: number;
  price: number;
  qty: number;
  notional: number;
  time: number;
  side: "buy" | "sell";
};

export type CryptoLiquidityResponse = {
  symbol: string;
  pair: string;
  source: "binance";
  updatedAt: number;
  bestBid: number;
  bestAsk: number;
  midPrice: number;
  spread: number;
  spreadBps: number;
  bidDepthQty: number;
  askDepthQty: number;
  bids: LiquidityLevel[];
  asks: LiquidityLevel[];
  trades: LiquidityTrade[];
};
