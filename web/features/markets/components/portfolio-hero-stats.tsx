"use client";

import type { PortfolioLiveStats } from "@/features/markets/lib/live-richness/build-portfolio-intelligence-from-live";
import { fmtPortfolioMoney, fmtPortfolioPct } from "@/features/markets/lib/portfolio-format";
import { portfolioRiskLevel } from "@/features/markets/lib/portfolio-cat-colors";
import { cn } from "@/lib/cn";

type Props = {
  stats: PortfolioLiveStats;
  positionCount: number;
  headlineSentiment: string;
};

function changeStatClass(v: number): string {
  return v >= 0 ? "pf-stat-change--up" : "pf-stat-change--down";
}

export function PortfolioHeroStats({ stats, positionCount, headlineSentiment }: Props) {
  const cur = stats.primaryCurrency;
  const riskLvl = portfolioRiskLevel(stats.riskScore);

  const dailyPrimary =
    stats.todayPnL != null ? (
      <>
        <span className={cn("pf-stat-value", stats.todayPnL >= 0 ? "pf-stat-change--up" : "pf-stat-change--down")}>
          {stats.todayPnL >= 0 ? "+" : ""}
          {fmtPortfolioMoney(stats.todayPnL, cur)}
        </span>
        <span className={cn("pf-stat-change", changeStatClass(stats.todayPnLPct))}>
          {fmtPortfolioPct(stats.todayPnLPct)}
        </span>
      </>
    ) : (
      <>
        <span className={cn("pf-stat-value", stats.todayPnLPct >= 0 ? "pf-stat-change--up" : "pf-stat-change--down")}>
          {fmtPortfolioPct(stats.todayPnLPct)}
        </span>
        <span className="pf-stat-change pf-stat-change--neutral">Ağırlıklı günlük</span>
      </>
    );

  return (
    <div className="pf-hero" data-pf-block-zone="overview">
      <div className="pf-stat">
        <span className="pf-stat-label">Toplam Değer</span>
        <span className="pf-stat-value pf-stat-value--accent">{fmtPortfolioMoney(stats.totalValue, cur)}</span>
        <span className="pf-stat-change pf-stat-change--neutral pf-stat-sub">
          Yatırılan: {fmtPortfolioMoney(stats.investedCost, cur)}
        </span>
      </div>
      <div className="pf-stat">
        <span className="pf-stat-label">{stats.todayPnL != null ? "Bugün P&L" : "Günlük hareket"}</span>
        {dailyPrimary}
      </div>
      <div className="pf-stat">
        <span className="pf-stat-label">Toplam P&L</span>
        <span className={cn("pf-stat-value", stats.totalPnL >= 0 ? "pf-stat-change--up" : "pf-stat-change--down")}>
          {stats.totalPnL >= 0 ? "+" : ""}
          {fmtPortfolioMoney(stats.totalPnL, cur)}
        </span>
        <span className={cn("pf-stat-change", changeStatClass(stats.totalPnLPct))}>
          {fmtPortfolioPct(stats.totalPnLPct)}
        </span>
      </div>
      <div className="pf-stat">
        <span className="pf-stat-label">Pozisyon</span>
        <span className="pf-stat-value">{positionCount}</span>
        <span className="pf-stat-change pf-stat-change--neutral">{headlineSentiment.slice(0, 22)}</span>
      </div>
      <div className="pf-stat">
        <span className="pf-stat-label">Risk Skoru</span>
        <span className={cn("pf-stat-value", "pf-stat-value--risk", `pf-risk-tone--${riskLvl}`)}>
          {stats.riskScore}
          <span className="pf-stat-risk-max">/100</span>
        </span>
        <span className="pf-stat-change pf-stat-change--neutral">{stats.riskLabel}</span>
      </div>
    </div>
  );
}
