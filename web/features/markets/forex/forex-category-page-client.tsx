"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { isMockDataEnabled } from "@/mock/config";

import { ForexPulseBar }       from "@/features/markets/forex/components/forex-pulse-bar";
import { ForexMarketRegime }    from "@/features/markets/forex/components/forex-market-regime";
import { ForexCurrencyHeatmap } from "@/features/markets/forex/components/forex-currency-heatmap";
import { ForexPairPanels }     from "@/features/markets/forex/components/forex-pair-panels";
import { ForexTopMovers }      from "@/features/markets/forex/components/forex-top-movers";
import { ForexBottomStrip }    from "@/features/markets/forex/components/forex-bottom-strip";
import { ForexScreener }       from "@/features/markets/forex/components/forex-screener";

export function ForexCategoryPageClient() {
  const mockOn = isMockDataEnabled();
  const repo   = useMemo(() => getMarketsRepository(), []);
  const data   = useMemo(() => repo.getForexCategoryDashboard(), [repo]);

  if (!data) {
    if (!mockOn) return <MarketsPageClient initialSegment="forex" />;
    return (
      <div className="forex-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState
            title="Forex önizleme kapalı"
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
    <div className="forex-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {/* Zone 0 — Pulse Bar */}
        <ForexPulseBar pulse={data.pulse} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 1 — Rejim + Para Birimi Güç Haritası */}
        <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,380px)]">
          <ForexMarketRegime regime={data.regime} />
          <ForexCurrencyHeatmap currencies={data.currencies} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 2 — EUR/USD + GBP/USD Paneller + Movers */}
        <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
          <div className="min-[1000px]:col-span-2">
            <ForexPairPanels eurusd={data.panels.eurusd} gbpusd={data.panels.gbpusd} />
          </div>
          <ForexTopMovers movers={data.movers} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 3 — Bottom Strip */}
        <ForexBottomStrip strip={data.bottom} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 4 — FX Screener */}
        <ForexScreener screener={data.screener} />

      </div>
    </div>
  );
}
