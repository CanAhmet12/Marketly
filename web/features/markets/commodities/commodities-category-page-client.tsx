"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { isMockDataEnabled } from "@/mock/config";

import { CommoditiesPulseBar }    from "@/features/markets/commodities/components/commodities-pulse-bar";
import { CommoditiesMarketRegime } from "@/features/markets/commodities/components/commodities-market-regime";
import { CommoditiesClassHeatmap } from "@/features/markets/commodities/components/commodities-class-heatmap";
import { CommoditiesAssetPanels }  from "@/features/markets/commodities/components/commodities-asset-panels";
import { CommoditiesTopMovers }   from "@/features/markets/commodities/components/commodities-top-movers";
import { CommoditiesBottomStrip } from "@/features/markets/commodities/components/commodities-bottom-strip";
import { CommoditiesScreener }    from "@/features/markets/commodities/components/commodities-screener";

export function CommoditiesCategoryPageClient() {
  const mockOn = isMockDataEnabled();
  const repo   = useMemo(() => getMarketsRepository(), []);
  const data   = useMemo(() => repo.getCommoditiesCategoryDashboard(), [repo]);

  if (!data) {
    if (!mockOn) return <MarketsPageClient initialSegment="commodity" />;
    return (
      <div className="commodities-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState
            title="Emtia önizleme kapalı"
            description="Tasarım önizlemesi için mock modunu açın veya canlı piyasa görünümüne geçin."
            actionLabel="Piyasalar"
            actionHref={MARKETS_HUB_PATH}
            tone="market"
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div className="commodities-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {/* Zone 0 — Pulse Bar */}
        <CommoditiesPulseBar pulse={data.pulse} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 1 — Piyasa Durumu + Sınıf Haritası */}
        <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,380px)]">
          <CommoditiesMarketRegime regime={data.regime} />
          <CommoditiesClassHeatmap classes={data.classes} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 2 — Altın + Petrol Paneller + Movers */}
        <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
          <div className="min-[1000px]:col-span-2">
            <CommoditiesAssetPanels altin={data.panels.altin} petrol={data.panels.petrol} />
          </div>
          <CommoditiesTopMovers movers={data.movers} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 3 — Bottom Strip */}
        <CommoditiesBottomStrip strip={data.bottom} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 4 — Emtia Screener */}
        <CommoditiesScreener screener={data.screener} />

      </div>
    </div>
  );
}
