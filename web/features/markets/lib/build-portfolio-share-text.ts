import type { PortfolioLiveStats } from "@/features/markets/lib/live-richness/build-portfolio-intelligence-from-live";
import { fmtPortfolioMoney, fmtPortfolioPct } from "@/features/markets/lib/portfolio-format";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";

export function buildPortfolioShareText(
  stats: PortfolioLiveStats,
  holdings: PortfolioIntelligenceBundle["holdings"],
): string {
  const cur = stats.primaryCurrency;
  const isUp = stats.totalPnL >= 0;
  const top = [...holdings].sort((a, b) => b.weightPct - a.weightPct).slice(0, 5);

  const lines = [
    `${isUp ? "📈" : "📉"} Portföy Performansı — Marketly`,
    "",
    `Toplam: ${fmtPortfolioMoney(stats.totalValue, cur)}`,
    `P&L: ${isUp ? "+" : ""}${fmtPortfolioMoney(stats.totalPnL, cur)} (${fmtPortfolioPct(stats.totalPnLPct)})`,
    stats.todayPnL != null
      ? `Bugün: ${stats.todayPnL >= 0 ? "+" : ""}${fmtPortfolioMoney(stats.todayPnL, cur)}`
      : null,
    "",
    top.length ? "Ağırlıklar:" : null,
    ...top.map((h) => `• ${h.symbol}: %${h.weightPct}`),
    "",
    "marketly.io/portfolio",
  ].filter((l): l is string => l != null);

  return lines.join("\n");
}
