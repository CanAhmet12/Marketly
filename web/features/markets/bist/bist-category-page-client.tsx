"use client";

import { EmptyState } from "@/components/states";
import { MarketsCategoryPageSkeleton } from "@/features/markets/components/markets-states";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { buildBistDashboardFromAssets } from "@/features/markets/lib/live-category/build-bist-dashboard-from-assets";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";

import { BistPulseBar }         from "@/features/markets/bist/components/bist-pulse-bar";
import { BistMarketState }       from "@/features/markets/bist/components/bist-market-state";
import { BistSectorPerformance } from "@/features/markets/bist/components/bist-sector-performance";
import { BistIndexPanels }       from "@/features/markets/bist/components/bist-index-panels";
import { BistTopMovers }         from "@/features/markets/bist/components/bist-top-movers";
import { BistBottomStrip }       from "@/features/markets/bist/components/bist-bottom-strip";
import { BistScreener }          from "@/features/markets/bist/components/bist-screener";

export function BistCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getBistCategoryDashboard(),
    buildBistDashboardFromAssets,
  );

  if (isLoading) {
    return (
      <div className="bist-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-8">
          <MarketsCategoryPageSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) return <MarketsPageClient initialSegment="stocks" />;
      return (
        <div className="bist-canvas min-h-screen w-full overflow-x-hidden">
          <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
            <EmptyState title="BIST kotasyonları henüz yok" description="Bu kategoride henüz BIST sembolü bulunamadı." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
          </div>
        </div>
      );
    }
    return (
      <div className="bist-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState title="BIST önizleme kapalı" description="Tasarım önizlemesi için mock modunu açın." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
        </div>
      </div>
    );
  }

  return (
    <div className="bist-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {zones.pulse ? <BistPulseBar pulse={data.pulse} /> : null}
        {zones.pulse ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.regime || (zones.segments && data.sectors.sectors.length > 0)) ? (
          <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,400px)]">
            {zones.regime ? <BistMarketState state={data.marketState} /> : null}
            {zones.segments && data.sectors.sectors.length > 0 ? (
              <BistSectorPerformance sectors={data.sectors} />
            ) : null}
          </div>
        ) : null}
        {zones.regime ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.panels || zones.movers) ? (
          <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
            {zones.panels ? (
              <div className="min-[1000px]:col-span-2">
                <BistIndexPanels bist100={data.panels.bist100} bist30={data.panels.bist30} />
              </div>
            ) : null}
            {zones.movers ? <BistTopMovers movers={data.movers} /> : null}
          </div>
        ) : null}
        {(zones.panels || zones.movers) ? <div className="cc-divider" aria-hidden /> : null}

        {zones.bottomStrip ? (
          <>
            <BistBottomStrip strip={data.bottom} />
            <div className="cc-divider" aria-hidden />
          </>
        ) : null}

        {zones.screener ? <BistScreener screener={data.screener} /> : null}

      </div>
    </div>
  );
}
