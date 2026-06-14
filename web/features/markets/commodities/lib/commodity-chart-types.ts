import type { CommodityKline } from "@/features/markets/commodities/lib/commodity-yahoo";

export type CommodityChartTimeframe = "15m" | "1h" | "1d" | "1w";

export type CommodityKlinesResponse = {
  symbol: string;
  ticker: string;
  interval: string;
  source: "yahoo";
  candles: CommodityKline[];
};

export const COMMODITY_CHART_TF_LABEL: Record<CommodityChartTimeframe, string> = {
  "15m": "15dk",
  "1h": "1S",
  "1d": "1G",
  "1w": "1H",
};

export const COMMODITY_CHART_TIMEFRAMES: CommodityChartTimeframe[] = ["15m", "1h", "1d", "1w"];

export const COMMODITY_KLINE_CONFIG: Record<
  CommodityChartTimeframe,
  { interval: string; range: string; refetchMs: number }
> = {
  "15m": { interval: "15m", range: "5d", refetchMs: 30_000 },
  "1h": { interval: "1h", range: "1mo", refetchMs: 60_000 },
  "1d": { interval: "1d", range: "6mo", refetchMs: 120_000 },
  "1w": { interval: "1wk", range: "2y", refetchMs: 300_000 },
};
