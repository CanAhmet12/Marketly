export type CryptoKline = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type CryptoKlinesResponse = {
  symbol: string;
  pair: string;
  interval: string;
  source: "binance" | "coingecko";
  candles: CryptoKline[];
};
