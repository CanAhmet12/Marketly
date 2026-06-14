export type DetailKline = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type DetailKlinesResponse = {
  symbol: string;
  pair: string;
  interval: string;
  source: "binance" | "coingecko";
  candles: DetailKline[];
};

export type DetailChartTimeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "6h" | "12h" | "3d" | "1w";

export type DetailChartMode = "classic" | "pro";

export type DetailChartView = "chart" | "liquidity";

export const DETAIL_CHART_TF_LABEL: Record<DetailChartTimeframe, string> = {
  "1m": "1dk",
  "5m": "5dk",
  "15m": "15dk",
  "30m": "30dk",
  "1h": "1S",
  "6h": "6S",
  "12h": "12S",
  "3d": "3G",
  "1w": "1H",
};

export const DETAIL_CHART_TIMEFRAMES: DetailChartTimeframe[] = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "6h",
  "12h",
  "3d",
  "1w",
];

export const DETAIL_CHART_MODE_LABEL: Record<DetailChartMode, string> = {
  classic: "Orijinal",
  pro: "Pro",
};

export const DETAIL_KLINE_CONFIG: Record<
  DetailChartTimeframe,
  { interval: string; limit: number; refetchMs: number }
> = {
  "1m": { interval: "1m", limit: 240, refetchMs: 15_000 },
  "5m": { interval: "5m", limit: 220, refetchMs: 20_000 },
  "15m": { interval: "15m", limit: 192, refetchMs: 30_000 },
  "30m": { interval: "30m", limit: 168, refetchMs: 30_000 },
  "1h": { interval: "1h", limit: 168, refetchMs: 60_000 },
  "6h": { interval: "6h", limit: 120, refetchMs: 120_000 },
  "12h": { interval: "12h", limit: 120, refetchMs: 120_000 },
  "3d": { interval: "1d", limit: 90, refetchMs: 180_000 },
  "1w": { interval: "1w", limit: 104, refetchMs: 300_000 },
};

export const DETAIL_CHART_MODES: DetailChartMode[] = ["classic", "pro"];

export const DETAIL_CHART_VIEWS: DetailChartView[] = ["chart", "liquidity"];

export const DETAIL_CHART_VIEW_LABEL: Record<DetailChartView, string> = {
  chart: "Grafik",
  liquidity: "Likidite",
};

export const DETAIL_CHART_INLINE_HEIGHT = 580;
export const DETAIL_CHART_MODAL_MIN_HEIGHT = 560;
