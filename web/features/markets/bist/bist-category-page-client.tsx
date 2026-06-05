"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { isMockDataEnabled } from "@/mock/config";

import { BistPulseBar }         from "@/features/markets/bist/components/bist-pulse-bar";
import { BistMarketState }       from "@/features/markets/bist/components/bist-market-state";
import { BistSectorPerformance } from "@/features/markets/bist/components/bist-sector-performance";
import { BistIndexPanels }       from "@/features/markets/bist/components/bist-index-panels";
import { BistTopMovers }         from "@/features/markets/bist/components/bist-top-movers";
import { BistBottomStrip }       from "@/features/markets/bist/components/bist-bottom-strip";
import { BistScreener }          from "@/features/markets/bist/components/bist-screener";

export function BistCategoryPageClient() {
  const mockOn = isMockDataEnabled();
  const repo   = useMemo(() => getMarketsRepository(), []);
  const data   = useMemo(() => repo.getBistCategoryDashboard(), [repo]);

  if (!data) {
    if (!mockOn) return <MarketsPageClient initialSegment="stocks" />;
    return (
      <div className="bist-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState
            title="BIST önizleme kapalı"
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
    <div className="bist-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {/* Zone 0 — Pulse Bar */}
        <BistPulseBar pulse={data.pulse} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 1 — Piyasa Durumu + Sektör */}
        <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,400px)]">
          <BistMarketState state={data.marketState} />
          <BistSectorPerformance sectors={data.sectors} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 2 — BIST 100/30 Paneller + Movers */}
        <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
          <div className="min-[1000px]:col-span-2">
            <BistIndexPanels bist100={data.panels.bist100} bist30={data.panels.bist30} />
          </div>
          <BistTopMovers movers={data.movers} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 3 — Bottom Strip */}
        <BistBottomStrip strip={data.bottom} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 4 — BIST Tarama Screener */}
        <BistScreener screener={data.screener} />

      </div>
    </div>
  );
}
