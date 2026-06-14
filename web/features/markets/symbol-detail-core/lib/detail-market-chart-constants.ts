export const MARKET_DETAIL_CHART_INLINE_HEIGHT = 580;

export type MarketDetailChartMode = "classic" | "pro";

export const MARKET_DETAIL_CHART_MODES: MarketDetailChartMode[] = ["classic", "pro"];

export const MARKET_DETAIL_CHART_MODE_LABEL: Record<MarketDetailChartMode, string> = {
  classic: "Orijinal",
  pro: "Pro",
};

export function fmtMarketSignedPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function fmtMarketCompactVolume(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}
