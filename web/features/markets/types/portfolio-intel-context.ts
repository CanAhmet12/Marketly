export type PortfolioIntelChip = {
  id: string;
  kind: "news" | "calendar";
  label: string;
  meta: string;
  href: string;
  impact: 1 | 2 | 3;
  symbol?: string;
};

export type PortfolioIntelContext = {
  headline: string;
  newsChips: readonly PortfolioIntelChip[];
  calendarChips: readonly PortfolioIntelChip[];
};

export function emptyPortfolioIntelContext(): PortfolioIntelContext {
  return {
    headline: "Portföy kesişimli haber ve makro olay bekleniyor",
    newsChips: [],
    calendarChips: [],
  };
}
