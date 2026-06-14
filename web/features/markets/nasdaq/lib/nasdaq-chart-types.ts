import type { CommodityKline } from "@/features/markets/commodities/lib/commodity-yahoo";

export const NASDAQ_SPARKLINE_RANGES = ["1d", "1mo", "3mo"] as const;

export type NasdaqSparklineRange = (typeof NASDAQ_SPARKLINE_RANGES)[number];

export const NASDAQ_SPARKLINE_RANGE_LABEL: Record<NasdaqSparklineRange, string> = {
  "1d": "1G",
  "1mo": "1A",
  "3mo": "3A",
};

export type NasdaqChartTimeframe = "15m" | "1h" | "1d" | "1w";

export const NASDAQ_CHART_TF_LABEL: Record<NasdaqChartTimeframe, string> = {
  "15m": "15dk",
  "1h": "1S",
  "1d": "1G",
  "1w": "1H",
};

export const NASDAQ_CHART_TIMEFRAMES: NasdaqChartTimeframe[] = ["15m", "1h", "1d", "1w"];

export const NASDAQ_KLINE_CONFIG: Record<
  NasdaqChartTimeframe,
  { interval: string; range: string; refetchMs: number }
> = {
  "15m": { interval: "15m", range: "5d", refetchMs: 30_000 },
  "1h": { interval: "1h", range: "1mo", refetchMs: 60_000 },
  "1d": { interval: "1d", range: "6mo", refetchMs: 120_000 },
  "1w": { interval: "1wk", range: "2y", refetchMs: 300_000 },
};

export type NasdaqKlinesResponse = {
  symbol: string;
  ticker: string;
  interval: string;
  source: "yahoo";
  candles: CommodityKline[];
};

export type NasdaqSparklineResponse = {
  symbol: string;
  ticker: string;
  source: "yahoo";
  range: NasdaqSparklineRange;
  price: number;
  changePct: number;
  sparkline: number[];
  stats: {
    destek: string;
    direnc: string;
    haftalik: string;
    aylik: string;
  };
};
