/** Trend piyasa şeridi + arama varlık iskeleti */

export type MockTrendMarket = {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  volume: string;
  trend: "up" | "down" | "flat";
};

export const MOCK_TREND_MARKETS: MockTrendMarket[] = [
  { symbol: "BTC", name: "Bitcoin", price: 104_320, change_percent: 1.85, volume: "42.1B", trend: "up" },
  { symbol: "ETH", name: "Ethereum", price: 2488, change_percent: -0.62, volume: "18.4B", trend: "down" },
  { symbol: "XU100", name: "BIST 100", price: 9124.5, change_percent: 0.34, volume: "12.2B TRY", trend: "up" },
  { symbol: "USDTRY", name: "Dolar/TL", price: 34.12, change_percent: 0.11, volume: "—", trend: "flat" },
  { symbol: "XAUUSD", name: "Ons Altın", price: 2341.2, change_percent: -0.28, volume: "—", trend: "down" },
  { symbol: "THYAO", name: "Türk Hava Yolları", price: 268.5, change_percent: 2.1, volume: "890M TRY", trend: "up" },
  { symbol: "ASELS", name: "Aselsan", price: 188.3, change_percent: -0.45, volume: "420M TRY", trend: "down" },
  { symbol: "GARAN", name: "Garanti BBVA", price: 112.4, change_percent: 0.08, volume: "1.1B TRY", trend: "flat" },
  { symbol: "NDX", name: "Nasdaq 100", price: 18_942, change_percent: 0.72, volume: "—", trend: "up" },
  { symbol: "SPX", name: "S&P 500", price: 5288, change_percent: 0.41, volume: "—", trend: "up" },
  { symbol: "SOL", name: "Solana", price: 142.8, change_percent: 2.4, volume: "3.1B", trend: "up" },
  { symbol: "AAPL", name: "Apple Inc.", price: 198.42, change_percent: 0.91, volume: "58M", trend: "up" },
  { symbol: "TSLA", name: "Tesla", price: 242.8, change_percent: -1.15, volume: "98M", trend: "down" },
  { symbol: "META", name: "Meta Platforms", price: 518.4, change_percent: 0.42, volume: "14M", trend: "up" },
  { symbol: "MSFT", name: "Microsoft", price: 412.9, change_percent: 0.38, volume: "21M", trend: "up" },
  { symbol: "WTI", name: "Ham petrol (WTI)", price: 78.35, change_percent: -0.88, volume: "—", trend: "down" },
  { symbol: "EURUSD", name: "Euro/Dolar", price: 1.0874, change_percent: 0.06, volume: "—", trend: "flat" },
  { symbol: "NVDA", name: "NVIDIA", price: 892.1, change_percent: 1.62, volume: "44M", trend: "up" },
];

export const MOCK_SEARCH_ASSETS = MOCK_TREND_MARKETS.map((m) => ({
  id: `mock-asset-${m.symbol.toLowerCase()}`,
  symbol: m.symbol,
  name: m.name,
}));
