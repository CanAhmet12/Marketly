"use client";

import { EmptyState } from "@/components/states";
import { MarketsCategoryPageSkeleton } from "@/features/markets/components/markets-states";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { buildForexDashboardFromAssets } from "@/features/markets/lib/live-category/build-forex-dashboard-from-assets";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";

import { ForexPulseBar }       from "@/features/markets/forex/components/forex-pulse-bar";
import { ForexMarketRegime }    from "@/features/markets/forex/components/forex-market-regime";
import { ForexCurrencyHeatmap } from "@/features/markets/forex/components/forex-currency-heatmap";
import { ForexPairPanels }     from "@/features/markets/forex/components/forex-pair-panels";
import { ForexTopMovers }      from "@/features/markets/forex/components/forex-top-movers";
import { ForexBottomStrip }    from "@/features/markets/forex/components/forex-bottom-strip";
import { ForexScreener }       from "@/features/markets/forex/components/forex-screener";

export function ForexCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getForexCategoryDashboard(),
    buildForexDashboardFromAssets,
  );

  if (isLoading) {
    return (
      <div className="forex-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-8">
          <MarketsCategoryPageSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) return <MarketsPageClient initialSegment="forex" />;
      return (
        <div className="forex-canvas min-h-screen w-full overflow-x-hidden">
          <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
            <EmptyState title="Forex kotasyonları henüz yok" description="Bu kategoride henüz canlı parite bulunamadı." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
          </div>
        </div>
      );
    }
    return (
      <div className="forex-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState title="Forex önizleme kapalı" description="Tasarım önizlemesi için mock modunu açın." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
        </div>
      </div>
    );
  }

  return (
    <div className="forex-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {zones.pulse ? <ForexPulseBar pulse={data.pulse} /> : null}
        {zones.pulse ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.regime || (zones.segments && data.currencies.currencies.length > 0)) ? (
          <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,380px)]">
            {zones.regime ? <ForexMarketRegime regime={data.regime} /> : null}
            {zones.segments && data.currencies.currencies.length > 0 ? (
              <ForexCurrencyHeatmap currencies={data.currencies} />
            ) : null}
          </div>
        ) : null}
        {zones.regime ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.panels || zones.movers) ? (
          <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
            {zones.panels ? (
              <div className="min-[1000px]:col-span-2">
                <ForexPairPanels eurusd={data.panels.eurusd} gbpusd={data.panels.gbpusd} />
              </div>
            ) : null}
            {zones.movers ? <ForexTopMovers movers={data.movers} /> : null}
          </div>
        ) : null}
        {(zones.panels || zones.movers) ? <div className="cc-divider" aria-hidden /> : null}

        {zones.bottomStrip ? (
          <>
            <ForexBottomStrip strip={data.bottom} />
            <div className="cc-divider" aria-hidden />
          </>
        ) : null}

        {zones.screener ? <ForexScreener screener={data.screener} /> : null}

      </div>
    </div>
  );
}
