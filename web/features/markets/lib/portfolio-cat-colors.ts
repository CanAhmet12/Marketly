/** Kategori → CSS sınıfı (pf-cat-badge, pf-weight-fill, pf-legend-dot, pf-donut-segment) */
export type PortfolioCategoryKey = "crypto" | "stocks" | "index" | "forex" | "commodity";

const CATEGORY_ALIASES: Record<string, PortfolioCategoryKey> = {
  crypto: "crypto",
  kripto: "crypto",
  stocks: "stocks",
  hisse: "stocks",
  index: "index",
  endeks: "index",
  forex: "forex",
  commodity: "commodity",
  emtia: "commodity",
};

export function portfolioCategoryKey(category: string): PortfolioCategoryKey {
  const key = CATEGORY_ALIASES[category.trim().toLowerCase()];
  return key ?? "crypto";
}

export function portfolioCategoryClass(prefix: string, category: string): string {
  return `${prefix}--${portfolioCategoryKey(category)}`;
}

export type PortfolioRiskLevel = "low" | "mid" | "high";

export function portfolioRiskLevel(score: number): PortfolioRiskLevel {
  if (score > 70) return "high";
  if (score > 45) return "mid";
  return "low";
}
