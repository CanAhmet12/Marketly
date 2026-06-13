"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { NasdaqBottomStrip } from "@/features/markets/nasdaq/components/nasdaq-bottom-strip";
import { NasdaqCategoryPageSkeleton } from "@/features/markets/nasdaq/components/nasdaq-category-skeleton";
import { NasdaqCategoryToolbar } from "@/features/markets/nasdaq/components/nasdaq-category-toolbar";
import { NasdaqIndexPanels } from "@/features/markets/nasdaq/components/nasdaq-index-panels";
import { NasdaqIntelDeck } from "@/features/markets/nasdaq/components/nasdaq-intel-deck";
import { NasdaqMarketRegime } from "@/features/markets/nasdaq/components/nasdaq-market-regime";
import { NasdaqPulseBar } from "@/features/markets/nasdaq/components/nasdaq-pulse-bar";
import { NasdaqScreenerBoard } from "@/features/markets/nasdaq/components/nasdaq-screener";
import { NasdaqSectorHeatmap } from "@/features/markets/nasdaq/components/nasdaq-sector-heatmap";
import { NasdaqSectorTreemap } from "@/features/markets/nasdaq/components/nasdaq-sector-treemap";
import { NasdaqSignalStrip } from "@/features/markets/nasdaq/components/nasdaq-signal-strip";
import { NasdaqTickerStrip } from "@/features/markets/nasdaq/components/nasdaq-ticker-strip";
import { NasdaqTopMovers } from "@/features/markets/nasdaq/components/nasdaq-top-movers";
import { mergeNasdaqBottomStrip } from "@/features/markets/nasdaq/lib/nasdaq-intel-utils";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { buildNasdaqDashboardFromAssets } from "@/features/markets/lib/live-category/build-nasdaq-dashboard-from-assets";
import { filterNasdaqAssets } from "@/features/markets/lib/live-category/live-category-shared";
import { LIVE_ZONES_ALL } from "@/features/markets/lib/live-category/live-category-zones";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { MockMarketsRepository } from "@/features/markets/repository/mock-markets-repository";

function NasdaqCanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="nasdaq-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">
        {children}
      </div>
    </div>
  );
}

export function NasdaqCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getNasdaqCategoryDashboard(),
    buildNasdaqDashboardFromAssets,
  );

  const previewRepo = useMemo(
    () => (!mockOn && !data && !isLoading ? new MockMarketsRepository() : null),
    [mockOn, data, isLoading],
  );
  const effectiveData = data ?? previewRepo?.getNasdaqCategoryDashboard() ?? null;
  const isDesignPreview = !data && Boolean(effectiveData);
  const effectiveZones = data ? zones : isDesignPreview ? LIVE_ZONES_ALL : zones;

  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets: liveAssets } = useMarketAssetsLive();
  const dashboard = useMemo(() => repo.getDashboardPayload(), [repo]);
  const previewDashboard = useMemo(() => previewRepo?.getDashboardPayload() ?? null, [previewRepo]);
  const { isWatched, toggleWatch, pendingSymbol } = useMarketsWatchlist(
    mockOn || isDesignPreview ? (previewRepo ?? repo).getWatchlistSeed() : undefined,
  );

  const nasdaqAssets = useMemo(() => {
    const pool = mockOn
      ? (dashboard?.assets ?? [])
      : data
        ? liveAssets
        : (previewDashboard?.assets ?? []);
    return filterNasdaqAssets(pool);
  }, [mockOn, dashboard?.assets, liveAssets, data, previewDashboard?.assets]);

  const nasdaqNewsIntel = useMemo(() => {
    const bundle = (previewRepo ?? repo).getMarketNewsroomBundle([], []);
    return bundle.items
      .filter((item) => item.newsCategory === "earnings" || item.newsCategory === "macro" || item.newsCategory === "flows")
      .slice(0, 4);
  }, [previewRepo, repo]);

  const nasdaqBottomStrip = useMemo(() => {
    if (!effectiveData) return null;
    const calendar = (previewRepo ?? repo).getEconomicCalendar().filter((row) => row.impact >= 2);
    return mergeNasdaqBottomStrip(effectiveData.bottom, calendar);
  }, [effectiveData, previewRepo, repo]);

  if (isLoading) {
    return (
      <NasdaqCanvasShell>
        <NasdaqCategoryPageSkeleton />
      </NasdaqCanvasShell>
    );
  }

  if (!effectiveData) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) {
        return (
          <NasdaqCanvasShell>
            <EmptyState
              title="Canlı NASDAQ verisi yüklenemedi"
              description="Kotasyonlar şu an alınamıyor. Bağlantınızı kontrol edin veya biraz sonra tekrar deneyin."
              actionLabel="Piyasalar"
              actionHref={MARKETS_HUB_PATH}
              tone="market"
              compact
            />
          </NasdaqCanvasShell>
        );
      }
      return (
        <NasdaqCanvasShell>
          <EmptyState
            title="NASDAQ kotasyonları henüz yok"
            description="Bu kategoride henüz ABD/teknoloji sembolü bulunamadı."
            actionLabel="Piyasalar"
            actionHref={MARKETS_HUB_PATH}
            tone="market"
            compact
          />
        </NasdaqCanvasShell>
      );
    }
    return (
      <NasdaqCanvasShell>
        <EmptyState
          title="NASDAQ önizleme kapalı"
          description="Tasarım önizlemesi için mock modunu açın."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
          compact
        />
      </NasdaqCanvasShell>
    );
  }

  const panels = effectiveData.panels;

  return (
    <NasdaqCanvasShell>
      {isDesignPreview ? (
        <div className="nq-preview-banner" role="status">
          Tasarım önizlemesi — canlı kotasyon bağlandığında otomatik güncellenir
        </div>
      ) : null}

      {nasdaqAssets.length > 0 ? (
        <>
          <NasdaqCategoryToolbar assets={nasdaqAssets} />
          <NasdaqTickerStrip assets={nasdaqAssets} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.pulse ? <NasdaqPulseBar pulse={effectiveData.pulse} /> : null}
      {effectiveZones.pulse ? <div className="cc-divider" aria-hidden /> : null}

      {(effectiveZones.regime || (effectiveZones.segments && effectiveData.sectors.sectors.length > 0)) ? (
        <div
          className={
            effectiveZones.segments && effectiveData.sectors.sectors.length > 0
              ? "grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,380px)]"
              : "flex flex-col"
          }
        >
          {effectiveZones.regime ? (
            <NasdaqMarketRegime
              regime={effectiveData.regime}
              pulse={effectiveData.pulse}
              live={!mockOn && !isDesignPreview}
            />
          ) : null}
          {effectiveZones.segments && effectiveData.sectors.sectors.length > 0 ? (
            <NasdaqSectorHeatmap sectors={effectiveData.sectors} />
          ) : null}
        </div>
      ) : null}
      {(effectiveZones.regime || effectiveZones.segments) ? <div className="cc-divider" aria-hidden /> : null}

      {effectiveZones.panels ? (
        <>
          <NasdaqIndexPanels ndx={panels.ndx} composite={panels.composite} sp500={panels.sp500} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.treemap && effectiveData.screener.assets.length >= 4 ? (
        <>
          <NasdaqSectorTreemap
            screenerAssets={effectiveData.screener.assets}
            treemap={effectiveData.treemap}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.intelDeck ? (
        <>
          <NasdaqIntelDeck movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : effectiveZones.movers ? (
        <>
          <NasdaqTopMovers movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.bottomStrip && nasdaqBottomStrip ? (
        <>
          <NasdaqBottomStrip strip={nasdaqBottomStrip} newsIntel={nasdaqNewsIntel} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.signals && effectiveData.signals.totalActiveSignals > 0 ? (
        <>
          <NasdaqSignalStrip
            signals={effectiveData.signals}
            useMockCatalog={mockOn || isDesignPreview}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.screener ? (
        <NasdaqScreenerBoard
          screener={effectiveData.screener}
          isWatched={isWatched}
          onToggleWatch={toggleWatch}
          watchPending={pendingSymbol}
        />
      ) : null}
    </NasdaqCanvasShell>
  );
}
