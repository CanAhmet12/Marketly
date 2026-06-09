/** Portföy sayfa modu — canlı vs kağıt */
export type PortfolioMode = "live" | "paper";

/** Blok bazlı renk bölgesi */
export type PortfolioBlockZone =
  | "overview"
  | "performance"
  | "holdings"
  | "allocation"
  | "risk"
  | "signals";

export type PortfolioBlockZoneMeta = {
  id: PortfolioBlockZone;
  label: string;
  chartPrimary: string;
};

export const PORTFOLIO_BLOCK_ZONE_META: Record<PortfolioBlockZone, PortfolioBlockZoneMeta> = {
  overview: { id: "overview", label: "Özet", chartPrimary: "#0f9d75" },
  performance: { id: "performance", label: "Performans", chartPrimary: "#0f9d75" },
  holdings: { id: "holdings", label: "Pozisyonlar", chartPrimary: "#06b6d4" },
  allocation: { id: "allocation", label: "Dağılım", chartPrimary: "#8b5cf6" },
  risk: { id: "risk", label: "Risk", chartPrimary: "#f97316" },
  signals: { id: "signals", label: "Sinyaller", chartPrimary: "#059669" },
};

export function resolvePortfolioMode(pageTitle: string): PortfolioMode {
  const t = pageTitle.toLowerCase();
  if (t.includes("kağıt") || t.includes("kagit") || t.includes("paper")) return "paper";
  return "live";
}

export function portfolioBlockChartColor(zone: PortfolioBlockZone): string {
  return PORTFOLIO_BLOCK_ZONE_META[zone].chartPrimary;
}
