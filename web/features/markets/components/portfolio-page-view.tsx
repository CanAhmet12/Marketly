"use client";

import { PortfolioAllocationDonut } from "@/features/markets/components/portfolio-allocation-donut";
import { PortfolioHeroStats } from "@/features/markets/components/portfolio-hero-stats";
import { PortfolioHoldingsTable } from "@/features/markets/components/portfolio-holdings-table";
import { PortfolioPageHeader } from "@/features/markets/components/portfolio-page-header";
import { PortfolioPerformanceChart } from "@/features/markets/components/portfolio-performance-chart";
import { PortfolioRiskPanel } from "@/features/markets/components/portfolio-risk-panel";
import { PortfolioIntelZone } from "@/features/markets/components/portfolio-intel-zone";
import { PortfolioShareCard } from "@/features/markets/components/portfolio-share-card";
import { PortfolioSignalsZone } from "@/features/markets/components/portfolio-signals-zone";
import { HubBodyGrid } from "@/features/hub/components/hub-hero-strip";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import type { PortfolioLiveStats } from "@/features/markets/lib/live-richness/build-portfolio-intelligence-from-live";
import { resolvePortfolioMode } from "@/features/markets/lib/portfolio-zone";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import type { PortfolioIntelContext } from "@/features/markets/types/portfolio-intel-context";
import type { PersonalizedSignalRelevance } from "@/features/signals/repository/types";

export type PortfolioHoldingRowEnrichment = {
  priceLabel: string;
  pnlPct: number;
  categoryKey: string;
};

export type PortfolioPageViewProps = {
  pageTitle: string;
  stats: PortfolioLiveStats;
  portfolio: PortfolioIntelligenceBundle;
  personalized: PersonalizedSignalRelevance;
  holdingEnrichment: Record<string, PortfolioHoldingRowEnrichment>;
  intel?: PortfolioIntelContext | null;
  valueColumnLabel?: "Fiyat" | "Değer";
  canAddHolding?: boolean;
  onAddHolding?: () => void;
};

export function PortfolioPageView({
  pageTitle,
  stats,
  portfolio,
  personalized,
  holdingEnrichment,
  intel,
  valueColumnLabel = "Fiyat",
  canAddHolding = false,
  onAddHolding,
}: PortfolioPageViewProps) {
  const { risk, overlaps, holdings, strategyMix, headlineSentiment } = portfolio;
  const mode = resolvePortfolioMode(pageTitle);

  return (
    <HubPageShell
      zone="finance"
      className="pf-canvas"
      data-portfolio-mode={mode}
      data-portfolio-zone="overview"
      header={
        <PortfolioPageHeader
          pageTitle={pageTitle}
          canAddHolding={canAddHolding}
          onAddHolding={onAddHolding}
          shareStats={stats}
          shareHoldings={holdings}
        />
      }
      hero={
        <PortfolioHeroStats stats={stats} positionCount={holdings.length} headlineSentiment={headlineSentiment} />
      }
    >
      {intel ? <PortfolioIntelZone intel={intel} /> : null}

      <PortfolioShareCard stats={stats} holdings={holdings} />

      <HubBodyGrid
        className="pf-main"
        main={
          <div className="pf-left">
            <PortfolioPerformanceChart stats={stats} pageTitle={pageTitle} />
            <PortfolioHoldingsTable
              holdings={holdings}
              holdingEnrichment={holdingEnrichment}
              valueColumnLabel={valueColumnLabel}
            />
          </div>
        }
        aside={
          <aside className="pf-sidebar">
            <div className="pf-sidebar-inner">
              <PortfolioAllocationDonut holdings={holdings} totalValue={stats.totalValue} currency={stats.primaryCurrency} />
              <PortfolioRiskPanel stats={stats} risk={risk} strategyMix={strategyMix} />
            </div>
          </aside>
        }
      />

      <PortfolioSignalsZone overlaps={overlaps} personalized={personalized} />
    </HubPageShell>
  );
}
