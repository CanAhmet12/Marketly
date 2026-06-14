export type ProDrawTool = "cursor" | "hline" | "trend" | "vline";

export type ProChartIndicators = {
  ema9: boolean;
  ema21: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
  volume: boolean;
};

export type ProHorizontalLine = {
  id: string;
  price: number;
  color: string;
};

export type ProTrendLine = {
  id: string;
  t1: number;
  p1: number;
  t2: number;
  p2: number;
  color: string;
};

export type ProVerticalLine = {
  id: string;
  time: number;
  color: string;
};

export type ProChartDrawings = {
  hlines: ProHorizontalLine[];
  trends: ProTrendLine[];
  vlines: ProVerticalLine[];
};

export type ProChartSettings = {
  indicators: ProChartIndicators;
  drawTool: ProDrawTool;
  drawings: ProChartDrawings;
  magnetCrosshair: boolean;
};

export const DEFAULT_PRO_INDICATORS: ProChartIndicators = {
  ema9: true,
  ema21: true,
  bollinger: true,
  rsi: true,
  macd: false,
  volume: true,
};

export function defaultProChartSettings(): ProChartSettings {
  return {
    indicators: { ...DEFAULT_PRO_INDICATORS },
    drawTool: "cursor",
    drawings: { hlines: [], trends: [], vlines: [] },
    magnetCrosshair: true,
  };
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
