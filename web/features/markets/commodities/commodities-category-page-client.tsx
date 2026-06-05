"use client";

import { EmptyState } from "@/components/states";
import { MarketsCategoryPageSkeleton } from "@/features/markets/components/markets-states";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { buildCommoditiesDashboardFromAssets } from "@/features/markets/lib/live-category/build-commodities-dashboard-from-assets";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";

import { CommoditiesPulseBar }    from "@/features/markets/commodities/components/commodities-pulse-bar";
import { CommoditiesMarketRegime } from "@/features/markets/commodities/components/commodities-market-regime";
import { CommoditiesClassHeatmap } from "@/features/markets/commodities/components/commodities-class-heatmap";
import { CommoditiesAssetPanels }  from "@/features/markets/commodities/components/commodities-asset-panels";
import { CommoditiesTopMovers }   from "@/features/markets/commodities/components/commodities-top-movers";
import { CommoditiesBottomStrip } from "@/features/markets/commodities/components/commodities-bottom-strip";
import { CommoditiesScreener }    from "@/features/markets/commodities/components/commodities-screener";

export function CommoditiesCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getCommoditiesCategoryDashboard(),
    buildCommoditiesDashboardFromAssets,
  );

  if (isLoading) {
    return (
      <div className="commodities-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-8">
          <MarketsCategoryPageSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) return <MarketsPageClient initialSegment="commodity" />;
      return (
        <div className="commodities-canvas min-h-screen w-full overflow-x-hidden">
          <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
            <EmptyState title="Emtia kotasyonları henüz yok" description="Bu kategoride henüz emtia sembolü bulunamadı." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
          </div>
        </div>
      );
    }
    return (
      <div className="commodities-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState title="Emtia önizleme kapalı" description="Tasarım önizlemesi için mock modunu açın." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
        </div>
      </div>
    );
  }

  return (
    <div className="commodities-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {zones.pulse ? <CommoditiesPulseBar pulse={data.pulse} /> : null}
        {zones.pulse ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.regime || (zones.segments && data.classes.classes.length > 0)) ? (
          <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,380px)]">
            {zones.regime ? <CommoditiesMarketRegime regime={data.regime} /> : null}
            {zones.segments && data.classes.classes.length > 0 ? (
              <CommoditiesClassHeatmap classes={data.classes} />
            ) : null}
          </div>
        ) : null}
        {zones.regime ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.panels || zones.movers) ? (
          <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
            {zones.panels ? (
              <div className="min-[1000px]:col-span-2">
                <CommoditiesAssetPanels altin={data.panels.altin} petrol={data.panels.petrol} />
              </div>
            ) : null}
            {zones.movers ? <CommoditiesTopMovers movers={data.movers} /> : null}
          </div>
        ) : null}
        {(zones.panels || zones.movers) ? <div className="cc-divider" aria-hidden /> : null}

        {zones.bottomStrip ? (
          <>
            <CommoditiesBottomStrip strip={data.bottom} />
            <div className="cc-divider" aria-hidden />
          </>
        ) : null}

        {zones.screener ? <CommoditiesScreener screener={data.screener} /> : null}

      </div>
    </div>
  );
}
