/**
 * Portföy premium görsel tokenları — TS tarafı (grafik/SVG referansı)
 * CSS kaynağı: portfolio-premium-visual.css + portfolio-tone-system.css
 */

export type PortfolioCategoryVisual = {
  id: "crypto" | "stocks" | "index" | "forex" | "commodity";
  label: string;
  fg: string;
  fill: string;
};

export const PORTFOLIO_CATEGORY_VISUALS: readonly PortfolioCategoryVisual[] = [
  { id: "crypto", label: "Kripto", fg: "#fcd34d", fill: "#e8a317" },
  { id: "stocks", label: "Hisse", fg: "#67e8f9", fill: "#22d3ee" },
  { id: "index", label: "Endeks", fg: "#c4b5fd", fill: "#a78bfa" },
  { id: "forex", label: "Forex", fg: "#a5b4fc", fill: "#818cf8" },
  { id: "commodity", label: "Emtia", fg: "#fdba74", fill: "#fb923c" },
] as const;

export const PORTFOLIO_MODE_CHART_COLORS = {
  live: "#0f9d75",
  paper: "#d4920a",
} as const;

export function portfolioChartColor(mode: "live" | "paper"): string {
  return PORTFOLIO_MODE_CHART_COLORS[mode];
}
