"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { buildForexDashboardFromAssets } from "@/features/markets/lib/live-category/build-forex-dashboard-from-assets";
import { filterForexAssets } from "@/features/markets/lib/live-category/live-category-shared";
import { LIVE_ZONES_ALL } from "@/features/markets/lib/live-category/live-category-zones";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { MockMarketsRepository } from "@/features/markets/repository/mock-markets-repository";

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

  const previewRepo = useMemo(
    () => (!mockOn && !data && !isLoading ? new MockMarketsRepository() : null),
    [mockOn, data, isLoading],
  );
  const effectiveData = data ?? previewRepo?.getForexCategoryDashboard() ?? null;
  const isDesignPreview = !data && Boolean(effectiveData);
  const effectiveZones = data ? zones : isDesignPreview ? LIVE_ZONES_ALL : zones;

  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets: liveAssets } = useMarketAssetsLive();
  const dashboard = useMemo(() => repo.getDashboardPayload(), [repo]);
  const previewDashboard = useMemo(() => previewRepo?.getDashboardPayload() ?? null, [previewRepo]);
  const { isWatched, toggleWatch, pendingSymbol } = useMarketsWatchlist(
    mockOn || isDesignPreview ? (previewRepo ?? repo).getWatchlistSeed() : undefined,
  );

  const forexAssets = useMemo(() => {
    const pool = mockOn
      ? (dashboard?.assets ?? [])
      : data
        ? liveAssets
        : (previewDashboard?.assets ?? []);
    return filterForexAssets(pool);
  }, [mockOn, dashboard?.assets, liveAssets, data, previewDashboard?.assets]);

  const forexNewsIntel = useMemo(() => {
    const bundle = (previewRepo ?? repo).getMarketNewsroomBundle([], []);
    return bundle.items
      .filter((item) => item.newsCategory === "macro" || item.newsCategory === "local")
      .slice(0, 4);
  }, [previewRepo, repo]);

  const forexBottomStrip = useMemo(() => {
    if (!effectiveData) return null;
    const calendar = (previewRepo ?? repo).getEconomicCalendar().filter((row) => row.impact >= 2);
    return mergeForexBottomStrip(effectiveData.bottom, calendar);
  }, [effectiveData, previewRepo, repo]);

  if (isLoading) {
    return (
      <ForexCanvasShell>
        <ForexCategoryPageSkeleton />
      </ForexCanvasShell>
    );
  }

  if (!effectiveData) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) {
        return (
          <ForexCanvasShell>
            <EmptyState
              title="Canlı forex verisi yüklenemedi"
              description="Kotasyonlar şu an alınamıyor. Bağlantınızı kontrol edin veya biraz sonra tekrar deneyin."
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
      {isDesignPreview ? (
        <div className="fc-preview-banner" role="status">
          Tasarım önizlemesi — canlı kotasyon bağlandığında otomatik güncellenir
        </div>
      ) : null}

      {forexAssets.length > 0 ? (
        <>
          <ForexCategoryToolbar assets={forexAssets} />
          <ForexTickerStrip assets={forexAssets} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.pulse ? <ForexPulseBar pulse={effectiveData.pulse} /> : null}
      {effectiveZones.pulse ? <div className="cc-divider" aria-hidden /> : null}

      {(effectiveZones.regime || (effectiveZones.segments && effectiveData.currencies.currencies.length > 0)) ? (
        <div
          className={
            effectiveZones.segments && effectiveData.currencies.currencies.length > 0
              ? "grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1fr_minmax(0,380px)]"
              : "flex flex-col"
          }
        >
          {effectiveZones.regime ? (
            <ForexMarketRegime
              regime={effectiveData.regime}
              pulse={effectiveData.pulse}
              live={!mockOn && !isDesignPreview}
            />
          ) : null}
          {effectiveZones.segments && effectiveData.currencies.currencies.length > 0 ? (
            <ForexCurrencyHeatmap currencies={effectiveData.currencies} />
          ) : null}
        </div>
      ) : null}
      {(effectiveZones.regime || effectiveZones.segments) ? <div className="cc-divider" aria-hidden /> : null}

      {effectiveZones.panels ? (
        <>
          <ForexPairPanels
            eurusd={effectiveData.panels.eurusd}
            gbpusd={effectiveData.panels.gbpusd}
            usdjpy={effectiveData.panels.usdjpy}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.treemap && effectiveData.screener.assets.length >= 4 ? (
        <>
          <ForexPairTreemap screenerAssets={effectiveData.screener.assets} treemap={effectiveData.treemap} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.intelDeck ? (
        <>
          <ForexIntelDeck movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : effectiveZones.movers ? (
        <>
          <ForexTopMovers movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.bottomStrip && forexBottomStrip ? (
        <>
          <ForexBottomStrip strip={forexBottomStrip} newsIntel={forexNewsIntel} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.signals && effectiveData.signals.totalActiveSignals > 0 ? (
        <>
          <ForexSignalStrip signals={effectiveData.signals} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.screener ? (
        <ForexScreenerBoard
          screener={effectiveData.screener}
          isWatched={isWatched}
          onToggleWatch={toggleWatch}
          watchPending={pendingSymbol}
        />
      ) : null}
    </ForexCanvasShell>
  );
}
