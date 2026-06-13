"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { BistBottomStrip } from "@/features/markets/bist/components/bist-bottom-strip";
import { BistCategoryPageSkeleton } from "@/features/markets/bist/components/bist-category-skeleton";
import { BistCategoryToolbar } from "@/features/markets/bist/components/bist-category-toolbar";
import { BistIndexPanels } from "@/features/markets/bist/components/bist-index-panels";
import { BistIntelDeck } from "@/features/markets/bist/components/bist-intel-deck";
import { BistMarketState } from "@/features/markets/bist/components/bist-market-state";
import { BistPulseBar } from "@/features/markets/bist/components/bist-pulse-bar";
import { BistScreenerBoard } from "@/features/markets/bist/components/bist-screener";
import { BistSectorPerformance } from "@/features/markets/bist/components/bist-sector-performance";
import { BistSectorTreemap } from "@/features/markets/bist/components/bist-sector-treemap";
import { BistSignalStrip } from "@/features/markets/bist/components/bist-signal-strip";
import { BistTickerStrip } from "@/features/markets/bist/components/bist-ticker-strip";
import { BistTopMovers } from "@/features/markets/bist/components/bist-top-movers";
import { mergeBistBottomStrip } from "@/features/markets/bist/lib/bist-intel-utils";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { buildBistDashboardFromAssets } from "@/features/markets/lib/live-category/build-bist-dashboard-from-assets";
import { filterBistAssets } from "@/features/markets/lib/live-category/live-category-shared";
import { LIVE_ZONES_ALL } from "@/features/markets/lib/live-category/live-category-zones";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { MockMarketsRepository } from "@/features/markets/repository/mock-markets-repository";

function BistCanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="bist-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">
        {children}
      </div>
    </div>
  );
}

export function BistCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getBistCategoryDashboard(),
    buildBistDashboardFromAssets,
  );

  const previewRepo = useMemo(
    () => (!mockOn && !data && !isLoading ? new MockMarketsRepository() : null),
    [mockOn, data, isLoading],
  );
  const effectiveData = data ?? previewRepo?.getBistCategoryDashboard() ?? null;
  const isDesignPreview = !data && Boolean(effectiveData);
  const effectiveZones = data ? zones : isDesignPreview ? LIVE_ZONES_ALL : zones;

  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets: liveAssets } = useMarketAssetsLive();
  const dashboard = useMemo(() => repo.getDashboardPayload(), [repo]);
  const previewDashboard = useMemo(() => previewRepo?.getDashboardPayload() ?? null, [previewRepo]);
  const { isWatched, toggleWatch, pendingSymbol } = useMarketsWatchlist(
    mockOn || isDesignPreview ? (previewRepo ?? repo).getWatchlistSeed() : undefined,
  );

  const bistAssets = useMemo(() => {
    const pool = mockOn
      ? (dashboard?.assets ?? [])
      : data
        ? liveAssets
        : (previewDashboard?.assets ?? []);
    return filterBistAssets(pool);
  }, [mockOn, dashboard?.assets, liveAssets, data, previewDashboard?.assets]);

  const bistNewsIntel = useMemo(() => {
    const bundle = (previewRepo ?? repo).getMarketNewsroomBundle([], []);
    return bundle.items
      .filter((item) => item.newsCategory === "local" || item.newsCategory === "macro")
      .slice(0, 4);
  }, [previewRepo, repo]);

  const bistBottomStrip = useMemo(() => {
    if (!effectiveData) return null;
    const calendar = (previewRepo ?? repo).getEconomicCalendar().filter((row) => row.impact >= 2);
    return mergeBistBottomStrip(effectiveData.bottom, calendar);
  }, [effectiveData, previewRepo, repo]);

  if (isLoading) {
    return (
      <BistCanvasShell>
        <BistCategoryPageSkeleton />
      </BistCanvasShell>
    );
  }

  if (!effectiveData) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) {
        return (
          <BistCanvasShell>
            <EmptyState
              title="Canlı BIST verisi yüklenemedi"
              description="Kotasyonlar şu an alınamıyor. Bağlantınızı kontrol edin veya biraz sonra tekrar deneyin."
              actionLabel="Piyasalar"
              actionHref={MARKETS_HUB_PATH}
              tone="market"
              compact
            />
          </BistCanvasShell>
        );
      }
      return (
        <BistCanvasShell>
          <EmptyState
            title="BIST kotasyonları henüz yok"
            description="Bu kategoride henüz BIST sembolü bulunamadı."
            actionLabel="Piyasalar"
            actionHref={MARKETS_HUB_PATH}
            tone="market"
            compact
          />
        </BistCanvasShell>
      );
    }
    return (
      <BistCanvasShell>
        <EmptyState
          title="BIST önizleme kapalı"
          description="Tasarım önizlemesi için mock modunu açın."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
          compact
        />
      </BistCanvasShell>
    );
  }

  const panels = effectiveData.panels;

  return (
    <BistCanvasShell>
      {isDesignPreview ? (
        <div className="bc-preview-banner" role="status">
          Tasarım önizlemesi — canlı kotasyon bağlandığında otomatik güncellenir
        </div>
      ) : null}

      {bistAssets.length > 0 ? (
        <>
          <BistCategoryToolbar assets={bistAssets} />
          <BistTickerStrip assets={bistAssets} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.pulse ? <BistPulseBar pulse={effectiveData.pulse} /> : null}
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
            <BistMarketState
              state={effectiveData.marketState}
              pulse={effectiveData.pulse}
              live={!mockOn && !isDesignPreview}
            />
          ) : null}
          {effectiveZones.segments && effectiveData.sectors.sectors.length > 0 ? (
            <BistSectorPerformance sectors={effectiveData.sectors} />
          ) : null}
        </div>
      ) : null}
      {(effectiveZones.regime || effectiveZones.segments) ? <div className="cc-divider" aria-hidden /> : null}

      {effectiveZones.panels ? (
        <>
          <BistIndexPanels bist100={panels.bist100} bist30={panels.bist30} bistBanka={panels.bistBanka} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.treemap && effectiveData.screener.assets.length >= 4 ? (
        <>
          <BistSectorTreemap
            screenerAssets={effectiveData.screener.assets}
            treemap={effectiveData.treemap}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.intelDeck ? (
        <>
          <BistIntelDeck movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : effectiveZones.movers ? (
        <>
          <BistTopMovers movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.bottomStrip && bistBottomStrip ? (
        <>
          <BistBottomStrip strip={bistBottomStrip} newsIntel={bistNewsIntel} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.signals && effectiveData.signals.totalActiveSignals > 0 ? (
        <>
          <BistSignalStrip
            signals={effectiveData.signals}
            useMockCatalog={mockOn || isDesignPreview}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.screener ? (
        <BistScreenerBoard
          screener={effectiveData.screener}
          isWatched={isWatched}
          onToggleWatch={toggleWatch}
          watchPending={pendingSymbol}
        />
      ) : null}
    </BistCanvasShell>
  );
}
