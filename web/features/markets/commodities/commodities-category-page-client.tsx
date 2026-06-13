"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { CommoditiesAssetPanels } from "@/features/markets/commodities/components/commodities-asset-panels";
import { CommoditiesBottomStrip } from "@/features/markets/commodities/components/commodities-bottom-strip";
import { CommoditiesCategoryPageSkeleton } from "@/features/markets/commodities/components/commodities-category-skeleton";
import { CommoditiesCategoryToolbar } from "@/features/markets/commodities/components/commodities-category-toolbar";
import { CommoditiesClassHeatmap } from "@/features/markets/commodities/components/commodities-class-heatmap";
import { CommoditiesClassTreemap } from "@/features/markets/commodities/components/commodities-class-treemap";
import { CommoditiesIntelDeck } from "@/features/markets/commodities/components/commodities-intel-deck";
import { CommoditiesMarketRegime } from "@/features/markets/commodities/components/commodities-market-regime";
import { CommoditiesPulseBar } from "@/features/markets/commodities/components/commodities-pulse-bar";
import { CommoditiesScreenerBoard } from "@/features/markets/commodities/components/commodities-screener";
import { CommoditiesSignalStrip } from "@/features/markets/commodities/components/commodities-signal-strip";
import { CommoditiesTickerStrip } from "@/features/markets/commodities/components/commodities-ticker-strip";
import { CommoditiesTopMovers } from "@/features/markets/commodities/components/commodities-top-movers";
import { mergeCommodityBottomStrip } from "@/features/markets/commodities/lib/commodity-intel-utils";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { buildCommoditiesDashboardFromAssets } from "@/features/markets/lib/live-category/build-commodities-dashboard-from-assets";
import { filterCommodityAssets } from "@/features/markets/lib/live-category/live-category-shared";
import { LIVE_ZONES_ALL } from "@/features/markets/lib/live-category/live-category-zones";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { MockMarketsRepository } from "@/features/markets/repository/mock-markets-repository";

function CommoditiesCanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="commodities-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">
        {children}
      </div>
    </div>
  );
}

export function CommoditiesCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getCommoditiesCategoryDashboard(),
    buildCommoditiesDashboardFromAssets,
  );

  const previewRepo = useMemo(
    () => (!mockOn && !data && !isLoading ? new MockMarketsRepository() : null),
    [mockOn, data, isLoading],
  );
  const effectiveData = data ?? previewRepo?.getCommoditiesCategoryDashboard() ?? null;
  const isDesignPreview = !data && Boolean(effectiveData);
  const effectiveZones = data ? zones : isDesignPreview ? LIVE_ZONES_ALL : zones;

  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets: liveAssets } = useMarketAssetsLive();
  const dashboard = useMemo(() => repo.getDashboardPayload(), [repo]);
  const previewDashboard = useMemo(() => previewRepo?.getDashboardPayload() ?? null, [previewRepo]);
  const { isWatched, toggleWatch, pendingSymbol } = useMarketsWatchlist(
    mockOn || isDesignPreview ? (previewRepo ?? repo).getWatchlistSeed() : undefined,
  );

  const commodityAssets = useMemo(() => {
    const pool = mockOn
      ? (dashboard?.assets ?? [])
      : data
        ? liveAssets
        : (previewDashboard?.assets ?? []);
    return filterCommodityAssets(pool);
  }, [mockOn, dashboard?.assets, liveAssets, data, previewDashboard?.assets]);

  const commodityNewsIntel = useMemo(() => {
    const bundle = (previewRepo ?? repo).getMarketNewsroomBundle([], []);
    return bundle.items
      .filter((item) => item.newsCategory === "macro" || item.newsCategory === "local")
      .slice(0, 4);
  }, [previewRepo, repo]);

  const commodityBottomStrip = useMemo(() => {
    if (!effectiveData) return null;
    const calendar = (previewRepo ?? repo).getEconomicCalendar().filter((row) => row.impact >= 2);
    return mergeCommodityBottomStrip(effectiveData.bottom, calendar);
  }, [effectiveData, previewRepo, repo]);

  if (isLoading) {
    return (
      <CommoditiesCanvasShell>
        <CommoditiesCategoryPageSkeleton />
      </CommoditiesCanvasShell>
    );
  }

  if (!effectiveData) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) {
        return (
          <CommoditiesCanvasShell>
            <EmptyState
              title="Canlı emtia verisi yüklenemedi"
              description="Kotasyonlar şu an alınamıyor. Bağlantınızı kontrol edin veya biraz sonra tekrar deneyin."
              actionLabel="Piyasalar"
              actionHref={MARKETS_HUB_PATH}
              tone="market"
              compact
            />
          </CommoditiesCanvasShell>
        );
      }
      return (
        <CommoditiesCanvasShell>
          <EmptyState
            title="Emtia kotasyonları henüz yok"
            description="Bu kategoride henüz emtia sembolü bulunamadı."
            actionLabel="Piyasalar"
            actionHref={MARKETS_HUB_PATH}
            tone="market"
            compact
          />
        </CommoditiesCanvasShell>
      );
    }
    return (
      <CommoditiesCanvasShell>
        <EmptyState
          title="Emtia önizleme kapalı"
          description="Tasarım önizlemesi için mock modunu açın."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
          compact
        />
      </CommoditiesCanvasShell>
    );
  }

  return (
    <CommoditiesCanvasShell>
      {isDesignPreview ? (
        <div className="cm-preview-banner" role="status">
          Tasarım önizlemesi — canlı kotasyon bağlandığında otomatik güncellenir
        </div>
      ) : null}

      {commodityAssets.length > 0 ? (
        <>
          <CommoditiesCategoryToolbar assets={commodityAssets} />
          <CommoditiesTickerStrip assets={commodityAssets} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.pulse ? <CommoditiesPulseBar pulse={effectiveData.pulse} /> : null}
      {effectiveZones.pulse ? <div className="cc-divider" aria-hidden /> : null}

      {(effectiveZones.regime || (effectiveZones.segments && effectiveData.classes.classes.length > 0)) ? (
        <div
          className={
            effectiveZones.segments && effectiveData.classes.classes.length > 0
              ? "grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,380px)]"
              : "flex flex-col"
          }
        >
          {effectiveZones.regime ? (
            <CommoditiesMarketRegime
              regime={effectiveData.regime}
              pulse={effectiveData.pulse}
              live={!mockOn && !isDesignPreview}
            />
          ) : null}
          {effectiveZones.segments && effectiveData.classes.classes.length > 0 ? (
            <CommoditiesClassHeatmap classes={effectiveData.classes} />
          ) : null}
        </div>
      ) : null}
      {(effectiveZones.regime || effectiveZones.segments) ? <div className="cc-divider" aria-hidden /> : null}

      {effectiveZones.panels ? (
        <>
          <CommoditiesAssetPanels
            altin={effectiveData.panels.altin}
            gumus={effectiveData.panels.gumus}
            petrol={effectiveData.panels.petrol}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.treemap && effectiveData.screener.assets.length >= 4 ? (
        <>
          <CommoditiesClassTreemap
            screenerAssets={effectiveData.screener.assets}
            treemap={effectiveData.treemap}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.intelDeck ? (
        <>
          <CommoditiesIntelDeck movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : effectiveZones.movers ? (
        <>
          <CommoditiesTopMovers movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.bottomStrip && commodityBottomStrip ? (
        <>
          <CommoditiesBottomStrip strip={commodityBottomStrip} newsIntel={commodityNewsIntel} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.signals && effectiveData.signals.totalActiveSignals > 0 ? (
        <>
          <CommoditiesSignalStrip
            signals={effectiveData.signals}
            useMockCatalog={mockOn || isDesignPreview}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.screener ? (
        <CommoditiesScreenerBoard
          screener={effectiveData.screener}
          isWatched={isWatched}
          onToggleWatch={toggleWatch}
          watchPending={pendingSymbol}
        />
      ) : null}
    </CommoditiesCanvasShell>
  );
}
