"use client";

import { EmptyState } from "@/components/states";
import { MarketsCategoryPageSkeleton } from "@/features/markets/components/markets-states";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { buildNasdaqDashboardFromAssets } from "@/features/markets/lib/live-category/build-nasdaq-dashboard-from-assets";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";

import { NasdaqPulseBar }         from "@/features/markets/nasdaq/components/nasdaq-pulse-bar";
import { NasdaqMarketRegime }       from "@/features/markets/nasdaq/components/nasdaq-market-regime";
import { NasdaqSectorHeatmap }      from "@/features/markets/nasdaq/components/nasdaq-sector-heatmap";
import { NasdaqIndexPanels }        from "@/features/markets/nasdaq/components/nasdaq-index-panels";
import { NasdaqTopMovers }          from "@/features/markets/nasdaq/components/nasdaq-top-movers";
import { NasdaqBottomStrip }        from "@/features/markets/nasdaq/components/nasdaq-bottom-strip";
import { NasdaqScreener }           from "@/features/markets/nasdaq/components/nasdaq-screener";

export function NasdaqCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getNasdaqCategoryDashboard(),
    buildNasdaqDashboardFromAssets,
  );

  if (isLoading) {
    return (
      <div className="nasdaq-canvas min-h-screen w-full overflow-x-hidden">
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
        <div className="nasdaq-canvas min-h-screen w-full overflow-x-hidden">
          <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
            <EmptyState title="NASDAQ kotasyonları henüz yok" description="Bu kategoride henüz ABD/teknoloji sembolü bulunamadı." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
          </div>
        </div>
      );
    }
    return (
      <div className="nasdaq-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState title="NASDAQ önizleme kapalı" description="Tasarım önizlemesi için mock modunu açın." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
        </div>
      </div>
    );
  }

  return (
    <div className="nasdaq-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {zones.pulse ? <NasdaqPulseBar pulse={data.pulse} /> : null}
        {zones.pulse ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.regime || (zones.segments && data.sectors.sectors.length > 0)) ? (
          <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,400px)]">
            {zones.regime ? <NasdaqMarketRegime regime={data.regime} /> : null}
            {zones.segments && data.sectors.sectors.length > 0 ? (
              <NasdaqSectorHeatmap sectors={data.sectors} />
            ) : null}
          </div>
        ) : null}
        {zones.regime ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.panels || zones.movers) ? (
          <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
            {zones.panels ? (
              <div className="min-[1000px]:col-span-2">
                <NasdaqIndexPanels ndx={data.panels.ndx} sp500={data.panels.sp500} />
              </div>
            ) : null}
            {zones.movers ? <NasdaqTopMovers movers={data.movers} /> : null}
          </div>
        ) : null}
        {(zones.panels || zones.movers) ? <div className="cc-divider" aria-hidden /> : null}

        {zones.bottomStrip ? (
          <>
            <NasdaqBottomStrip strip={data.bottom} />
            <div className="cc-divider" aria-hidden />
          </>
        ) : null}

        {zones.screener ? <NasdaqScreener screener={data.screener} /> : null}

      </div>
    </div>
  );
}
