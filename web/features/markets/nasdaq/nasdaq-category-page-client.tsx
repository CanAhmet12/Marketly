"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { isMockDataEnabled } from "@/mock/config";

import { NasdaqPulseBar }     from "@/features/markets/nasdaq/components/nasdaq-pulse-bar";
import { NasdaqMarketRegime }  from "@/features/markets/nasdaq/components/nasdaq-market-regime";
import { NasdaqSectorHeatmap } from "@/features/markets/nasdaq/components/nasdaq-sector-heatmap";
import { NasdaqIndexPanels }  from "@/features/markets/nasdaq/components/nasdaq-index-panels";
import { NasdaqTopMovers }    from "@/features/markets/nasdaq/components/nasdaq-top-movers";
import { NasdaqBottomStrip }  from "@/features/markets/nasdaq/components/nasdaq-bottom-strip";
import { NasdaqScreener }     from "@/features/markets/nasdaq/components/nasdaq-screener";

export function NasdaqCategoryPageClient() {
  const mockOn = isMockDataEnabled();
  const repo   = useMemo(() => getMarketsRepository(), []);
  const data   = useMemo(() => repo.getNasdaqCategoryDashboard(), [repo]);

  if (!data) {
    if (!mockOn) return <MarketsPageClient initialSegment="stocks" />;
    return (
      <div className="nasdaq-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState
            title="NASDAQ önizleme kapalı"
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
    <div className="nasdaq-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {/* Zone 0 — Pulse Bar */}
        <NasdaqPulseBar pulse={data.pulse} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 1 — Rejim + Sektör Haritası */}
        <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,400px)]">
          <NasdaqMarketRegime regime={data.regime} />
          <NasdaqSectorHeatmap sectors={data.sectors} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 2 — NDX + S&P 500 Paneller + Movers */}
        <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
          <div className="min-[1000px]:col-span-2">
            <NasdaqIndexPanels ndx={data.panels.ndx} sp500={data.panels.sp500} />
          </div>
          <NasdaqTopMovers movers={data.movers} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 3 — Bottom Strip */}
        <NasdaqBottomStrip strip={data.bottom} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 4 — Screener */}
        <NasdaqScreener screener={data.screener} />

      </div>
    </div>
  );
}
