export type CryptoChartRangeId = "1G" | "7G" | "1A" | "3A" | "1Y";

export type CryptoChartCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type CryptoChartRangeConfig = {
  id: CryptoChartRangeId;
  label: string;
  days: number;
};

export const CRYPTO_CHART_RANGES: readonly CryptoChartRangeConfig[] = [
  { id: "1G", label: "24s", days: 1 },
  { id: "7G", label: "7G", days: 7 },
  { id: "1A", label: "1A", days: 30 },
  { id: "3A", label: "3A", days: 90 },
  { id: "1Y", label: "1Y", days: 365 },
] as const;

export type CryptoChartApiResponse = {
  symbol: string;
  days: number;
  source: "coingecko" | "fallback";
  candles: CryptoChartCandle[];
};

export type CryptoChartRangeStats = {
  high: number;
  low: number;
  changePct: number;
  volumeLabel: string;
};
