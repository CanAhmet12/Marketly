import {
  emptyPortfolioIntelContext,
  type PortfolioIntelChip,
  type PortfolioIntelContext,
} from "@/features/markets/types/portfolio-intel-context";
import type {
  EconomicCalendarIntelEvent,
  MarketNewsIntelligenceItem,
} from "@/features/markets/types/news-calendar-intelligence";

function trimLabel(text: string, max = 52): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function toNewsChip(item: MarketNewsIntelligenceItem): PortfolioIntelChip {
  return {
    id: item.id,
    kind: "news",
    label: trimLabel(item.headline),
    meta: item.symbol,
    href: `/market-news/${item.id}`,
    impact: item.impactTier,
    symbol: item.symbol,
  };
}

function toCalendarChip(event: EconomicCalendarIntelEvent): PortfolioIntelChip {
  return {
    id: event.id,
    kind: "calendar",
    label: trimLabel(event.title),
    meta: event.country,
    href: `/economic-calendar/${event.id}`,
    impact: event.impact,
    symbol: event.affectedSymbols[0],
  };
}

/** Haber + takvim feed → portföy etki chip'leri */
export function buildPortfolioIntelContext(
  newsItems: readonly MarketNewsIntelligenceItem[],
  calendarEvents: readonly EconomicCalendarIntelEvent[],
  _portfolioSymbols: readonly string[],
): PortfolioIntelContext {
  const newsChips = newsItems.filter((i) => i.hitsPortfolio).slice(0, 5).map(toNewsChip);
  const calendarChips = calendarEvents.filter((e) => e.hitsPortfolio).slice(0, 5).map(toCalendarChip);

  if (!newsChips.length && !calendarChips.length) {
    return emptyPortfolioIntelContext();
  }

  const headline =
    newsChips.length && calendarChips.length
      ? `${newsChips.length} haber · ${calendarChips.length} makro olay portföyünü etkiliyor`
      : newsChips.length
        ? `${newsChips.length} haber portföy sembollerinde`
        : `${calendarChips.length} makro olay portföyünde`;

  return { headline, newsChips, calendarChips };
}
