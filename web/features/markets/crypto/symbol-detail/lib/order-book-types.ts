export type OrderBookLevel = {
  price: number;
  qty: number;
  total: number;
  depthPct: number;
};

export type OrderBookSnapshot = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPct: number;
  mid: number;
  source: "binance" | "bybit";
  connected: boolean;
};

export const ORDER_BOOK_LEVELS = 12;
