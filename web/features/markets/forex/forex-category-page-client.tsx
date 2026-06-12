"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { buildForexDashboardFromAssets } from "@/features/markets/lib/live-category/build-forex-dashboard-from-assets";
import { filterForexAssets } from "@/features/markets/lib/live-category/live-category-shared";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";

import { ForexBottomStrip } from "@/features/markets/forex/components/forex-bottom-strip";
import { ForexCategoryPageSkeleton } from "@/features/markets/forex/components/forex-category-skeleton";
import { ForexCategoryToolbar } from "@/features/markets/forex/components/forex-category-toolbar";
import { ForexCurrencyHeatmap } from "@/features/markets/forex/components/forex-currency-heatmap";
import { ForexIntelDeck } from "@/features/markets/forex/components/forex-intel-deck";
import { mergeForexBottomStrip } from "@/features/markets/forex/lib/forex-intel-utils";
import { ForexMarketRegime } from "@/features/markets/forex/components/forex-market-regime";
import { ForexPairPanels } from "@/features/markets/forex/components/forex-pair-panels";
import { ForexPairTreemap } from "@/features/markets/forex/components/forex-pair-treemap";
import { ForexPulseBar } from "@/features/markets/forex/components/forex-pulse-bar";
import { ForexScreenerBoard } from "@/features/markets/forex/components/forex-screener";
import { ForexSignalStrip } from "@/features/markets/forex/components/forex-signal-strip";
import { ForexTickerStrip } from "@/features/markets/forex/components/forex-ticker-strip";
import { ForexTopMovers } from "@/features/markets/forex/components/forex-top-movers";

function ForexCanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="forex-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">
        {children}
      </div>
    </div>
  );
}

export function ForexCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getForexCategoryDashboard(),
    buildForexDashboardFromAssets,
  );

  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets: liveAssets } = useMarketAssetsLive();
  const dashboard = useMemo(() => repo.getDashboardPayload(), [repo]);
  const { isWatched, toggleWatch, pendingSymbol } = useMarketsWatchlist(
    mockOn ? repo.getWatchlistSeed() : undefined,
  );

  const forexAssets = useMemo(() => {
    const pool = mockOn ? (dashboard?.assets ?? []) : liveAssets;
    return filterForexAssets(pool);
  }, [mockOn, dashboard?.assets, liveAssets]);

  const forexNewsIntel = useMemo(() => {
    const bundle = repo.getMarketNewsroomBundle([], []);
    return bundle.items
      .filter((item) => item.newsCategory === "macro" || item.newsCategory === "local")
      .slice(0, 4);
  }, [repo]);

  const forexBottomStrip = useMemo(() => {
    if (!data) return null;
    const calendar = repo.getEconomicCalendar().filter((row) => row.impact >= 2);
    return mergeForexBottomStrip(data.bottom, calendar);
  }, [data, repo]);

  if (isLoading) {
    return (
      <ForexCanvasShell>
        <ForexCategoryPageSkeleton />
      </ForexCanvasShell>
    );
  }

  if (!data) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) {
        return <MarketsPageClient initialSegment="forex" />;
      }
      return (
        <ForexCanvasShell>
          <EmptyState
            title="Forex kotasyonları henüz yok"
            description="Bu kategoride henüz canlı parite bulunamadı. Piyasalar sayfasından tüm sembolleri görüntüleyebilirsiniz."
            actionLabel="Piyasalar"
            actionHref={MARKETS_HUB_PATH}
            tone="market"
            compact
          />
        </ForexCanvasShell>
      );
    }
    return (
      <ForexCanvasShell>
        <EmptyState
          title="Forex önizleme kapalı"
          description="Tasarım önizlemesi için mock modunu açın veya canlı piyasa görünümüne geçin."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
          compact
        />
      </ForexCanvasShell>
    );
  }

  return (
    <ForexCanvasShell>
      {forexAssets.length > 0 ? (
        <>
          <ForexCategoryToolbar assets={forexAssets} />
          <ForexTickerStrip assets={forexAssets} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {zones.pulse ? <ForexPulseBar pulse={data.pulse} /> : null}
      {zones.pulse ? <div className="cc-divider" aria-hidden /> : null}

      {(zones.regime || (zones.segments && data.currencies.currencies.length > 0)) ? (
        <div
          className={
            zones.segments && data.currencies.currencies.length > 0
              ? "grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,380px)]"
              : "flex flex-col"
          }
        >
          {zones.regime ? (
            <ForexMarketRegime regime={data.regime} pulse={data.pulse} live={!mockOn} />
          ) : null}
          {zones.segments && data.currencies.currencies.length > 0 ? (
            <ForexCurrencyHeatmap currencies={data.currencies} />
          ) : null}
        </div>
      ) : null}
      {(zones.regime || zones.segments) ? <div className="cc-divider" aria-hidden /> : null}

      {zones.panels ? (
        <>
          <ForexPairPanels
            eurusd={data.panels.eurusd}
            gbpusd={data.panels.gbpusd}
            usdjpy={data.panels.usdjpy}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {zones.treemap && data.screener.assets.length >= 4 ? (
        <>
          <ForexPairTreemap screenerAssets={data.screener.assets} treemap={data.treemap} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {zones.intelDeck ? (
        <>
          <ForexIntelDeck movers={data.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : zones.movers ? (
        <>
          <ForexTopMovers movers={data.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {zones.bottomStrip && forexBottomStrip ? (
        <>
          <ForexBottomStrip strip={forexBottomStrip} newsIntel={forexNewsIntel} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {zones.signals && data.signals.totalActiveSignals > 0 ? (
        <>
          <ForexSignalStrip signals={data.signals} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {zones.screener ? (
        <ForexScreenerBoard
          screener={data.screener}
          isWatched={isWatched}
          onToggleWatch={toggleWatch}
          watchPending={pendingSymbol}
        />
      ) : null}
    </ForexCanvasShell>
  );
}
