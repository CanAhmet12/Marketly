"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { CryptoBottomStrip } from "@/features/markets/crypto/components/crypto-bottom-strip";
import { CryptoBtcEthPanels } from "@/features/markets/crypto/components/crypto-btc-eth-panels";
import { CryptoCategoryPageSkeleton } from "@/features/markets/crypto/components/crypto-category-skeleton";
import { CryptoCategoryToolbar } from "@/features/markets/crypto/components/crypto-category-toolbar";
import { CryptoIntelDeck } from "@/features/markets/crypto/components/crypto-intel-deck";
import { CryptoPulseBar } from "@/features/markets/crypto/components/crypto-pulse-bar";
import { CryptoRegimeDominance } from "@/features/markets/crypto/components/crypto-regime-dominance";
import { CryptoScreenerBoard } from "@/features/markets/crypto/components/crypto-screener-board";
import { CryptoSegmentHeatmap } from "@/features/markets/crypto/components/crypto-segment-heatmap";
import { CryptoSegmentTreemap } from "@/features/markets/crypto/components/crypto-segment-treemap";
import { CryptoSignalStrip } from "@/features/markets/crypto/components/crypto-signal-strip";
import { CryptoTickerStrip } from "@/features/markets/crypto/components/crypto-ticker-strip";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { filterCategory } from "@/features/markets/lib/live-category/live-category-shared";
import { buildCryptoDashboardFromAssets } from "@/features/markets/lib/live-category/build-crypto-dashboard-from-assets";
import { LIVE_ZONES_ALL } from "@/features/markets/lib/live-category/live-category-zones";
import { getMarketsRepository } from "@/features/markets/repository";
import { MockMarketsRepository } from "@/features/markets/repository/mock-markets-repository";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";

function CryptoCanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="crypto-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">
        {children}
      </div>
    </div>
  );
}

export function CryptoCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getCryptoCategoryDashboard(),
    buildCryptoDashboardFromAssets,
  );

  const previewRepo = useMemo(
    () => (!mockOn && !data && !isLoading ? new MockMarketsRepository() : null),
    [mockOn, data, isLoading],
  );
  const effectiveData = data ?? previewRepo?.getCryptoCategoryDashboard() ?? null;
  const isDesignPreview = !data && Boolean(effectiveData);
  const effectiveZones = data ? zones : isDesignPreview ? LIVE_ZONES_ALL : zones;

  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets: liveAssets } = useMarketAssetsLive();
  const dashboard = useMemo(() => repo.getDashboardPayload(), [repo]);
  const previewDashboard = useMemo(() => previewRepo?.getDashboardPayload() ?? null, [previewRepo]);
  const { isWatched, toggleWatch, pendingSymbol } = useMarketsWatchlist(
    mockOn || isDesignPreview ? (previewRepo ?? repo).getWatchlistSeed() : undefined,
  );

  const cryptoAssets = useMemo(() => {
    const pool = mockOn
      ? (dashboard?.assets ?? [])
      : data
        ? liveAssets
        : (previewDashboard?.assets ?? []);
    return filterCategory(pool, "crypto");
  }, [mockOn, dashboard?.assets, liveAssets, data, previewDashboard?.assets]);

  const cryptoNewsIntel = useMemo(() => {
    const bundle = (previewRepo ?? repo).getMarketNewsroomBundle([], []);
    return bundle.items.filter((item) => item.newsCategory === "crypto").slice(0, 4);
  }, [previewRepo, repo]);

  if (isLoading) {
    return (
      <CryptoCanvasShell>
        <CryptoCategoryPageSkeleton />
      </CryptoCanvasShell>
    );
  }

  if (!effectiveData) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) {
        return (
          <CryptoCanvasShell>
            <EmptyState
              title="Canlı kripto verisi yüklenemedi"
              description="Kotasyonlar şu an alınamıyor. Bağlantınızı kontrol edin veya biraz sonra tekrar deneyin."
              actionLabel="Piyasalar"
              actionHref={MARKETS_HUB_PATH}
              tone="market"
              compact
            />
          </CryptoCanvasShell>
        );
      }
      return (
        <CryptoCanvasShell>
          <EmptyState
            title="Kripto kotasyonları henüz yok"
            description="Bu kategoride henüz canlı fiyat bulunamadı. Piyasalar sayfasından tüm sembolleri görüntüleyebilirsiniz."
            actionLabel="Piyasalar"
            actionHref={MARKETS_HUB_PATH}
            tone="market"
            compact
          />
        </CryptoCanvasShell>
      );
    }
    return (
      <CryptoCanvasShell>
        <EmptyState
          title="Kripto önizleme kapalı"
          description="Tasarım önizlemesi için mock modunu açın veya canlı piyasa görünümüne geçin."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
          compact
        />
      </CryptoCanvasShell>
    );
  }

  return (
    <CryptoCanvasShell>
      {isDesignPreview ? (
        <div className="cc-preview-banner" role="status">
          Tasarım önizlemesi — canlı kotasyon bağlandığında otomatik güncellenir
        </div>
      ) : null}

      {cryptoAssets.length > 0 ? (
        <>
          <CryptoCategoryToolbar assets={cryptoAssets} />
          <CryptoTickerStrip assets={cryptoAssets} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.pulse ? <CryptoPulseBar pulse={effectiveData.phase1.pulse} /> : null}
      {effectiveZones.pulse ? <div className="cc-divider" aria-hidden /> : null}

      {(effectiveZones.regime || (effectiveZones.segments && effectiveData.segments.segments.length > 0)) ? (
        <div
          className={
            effectiveZones.segments && effectiveData.segments.segments.length > 0
              ? "grid grid-cols-1 gap-8 min-[860px]:grid-cols-[1fr_minmax(0,340px)]"
              : "flex flex-col"
          }
        >
          {effectiveZones.regime ? (
            <CryptoRegimeDominance
              regime={effectiveData.phase1.regime}
              pulse={effectiveData.phase1.pulse}
              live={!mockOn && !isDesignPreview}
            />
          ) : null}
          {effectiveZones.segments && effectiveData.segments.segments.length > 0 ? (
            <CryptoSegmentHeatmap segments={effectiveData.segments} />
          ) : null}
        </div>
      ) : null}
      {(effectiveZones.regime || effectiveZones.segments) ? <div className="cc-divider" aria-hidden /> : null}

      {effectiveZones.panels ? (
        <>
          <CryptoBtcEthPanels
            btc={effectiveData.phase1.btc}
            eth={effectiveData.phase1.eth}
            sol={effectiveData.phase1.sol}
          />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.treemap && effectiveData.screener.assets.length >= 4 ? (
        <>
          <CryptoSegmentTreemap screenerAssets={effectiveData.screener.assets} treemap={effectiveData.treemap} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.intelDeck ? (
        <>
          <CryptoIntelDeck movers={effectiveData.movers} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.bottomStrip ? (
        <>
          <CryptoBottomStrip strip={effectiveData.bottomStrip} newsIntel={cryptoNewsIntel} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.signals && effectiveData.signals.totalActiveSignals > 0 ? (
        <>
          <CryptoSignalStrip signals={effectiveData.signals} useMockCatalog={mockOn || isDesignPreview} />
          <div className="cc-divider" aria-hidden />
        </>
      ) : null}

      {effectiveZones.screener ? (
        <CryptoScreenerBoard
          screener={effectiveData.screener}
          isWatched={isWatched}
          onToggleWatch={toggleWatch}
          watchPending={pendingSymbol}
        />
      ) : null}
    </CryptoCanvasShell>
  );
}
