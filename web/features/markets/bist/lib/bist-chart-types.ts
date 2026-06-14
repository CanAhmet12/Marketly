import type { CommodityKline } from "@/features/markets/commodities/lib/commodity-yahoo";

export const BIST_SPARKLINE_RANGES = ["1d", "1mo", "3mo"] as const;

export type BistSparklineRange = (typeof BIST_SPARKLINE_RANGES)[number];

export const BIST_SPARKLINE_RANGE_LABEL: Record<BistSparklineRange, string> = {
  "1d": "1G",
  "1mo": "1A",
  "3mo": "3A",
};

export type BistSparklineResponse = {
  symbol: string;
  ticker: string;
  source: "yahoo";
  range: BistSparklineRange;
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

export type BistChartTimeframe = "15m" | "1h" | "1d" | "1w";

export const BIST_CHART_TF_LABEL: Record<BistChartTimeframe, string> = {
  "15m": "15dk",
  "1h": "1S",
  "1d": "1G",
  "1w": "1H",
};

export const BIST_CHART_TIMEFRAMES: BistChartTimeframe[] = ["15m", "1h", "1d", "1w"];

export const BIST_KLINE_CONFIG: Record<
  BistChartTimeframe,
  { interval: string; range: string; refetchMs: number }
> = {
  "15m": { interval: "15m", range: "5d", refetchMs: 30_000 },
  "1h": { interval: "1h", range: "1mo", refetchMs: 60_000 },
  "1d": { interval: "1d", range: "6mo", refetchMs: 120_000 },
  "1w": { interval: "1wk", range: "2y", refetchMs: 300_000 },
};

export type BistKlinesResponse = {
  symbol: string;
  ticker: string;
  interval: string;
  source: "yahoo";
  candles: CommodityKline[];
  xu100Correlation: number | null;
  correlationLabel: string | null;
};
