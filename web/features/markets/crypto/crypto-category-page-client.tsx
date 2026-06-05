"use client";

import { EmptyState } from "@/components/states";
import { MarketsCategoryPageSkeleton } from "@/features/markets/components/markets-states";
import { useCategoryDashboard } from "@/features/markets/hooks/use-category-dashboard";
import { buildCryptoDashboardFromAssets } from "@/features/markets/lib/live-category/build-crypto-dashboard-from-assets";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";

import { CryptoPulseBar }       from "@/features/markets/crypto/components/crypto-pulse-bar";
import { CryptoRegimeDominance } from "@/features/markets/crypto/components/crypto-regime-dominance";
import { CryptoSegmentHeatmap }  from "@/features/markets/crypto/components/crypto-segment-heatmap";
import { CryptoBtcEthPanels }   from "@/features/markets/crypto/components/crypto-btc-eth-panels";
import { CryptoTopMovers }      from "@/features/markets/crypto/components/crypto-top-movers";
import { CryptoSignalStrip }    from "@/features/markets/crypto/components/crypto-signal-strip";
import { CryptoScreenerBoard }  from "@/features/markets/crypto/components/crypto-screener-board";
import { CryptoBottomStrip }    from "@/features/markets/crypto/components/crypto-bottom-strip";

export function CryptoCategoryPageClient() {
  const { mockOn, data, zones, isLoading, hasGlobalAssets, fetchError } = useCategoryDashboard(
    (repo) => repo.getCryptoCategoryDashboard(),
    buildCryptoDashboardFromAssets,
  );

  if (isLoading) {
    return (
      <div className="crypto-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-8">
          <MarketsCategoryPageSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    if (!mockOn) {
      if (fetchError || !hasGlobalAssets) {
        return <MarketsPageClient initialSegment="crypto" />;
      }
      return (
        <div className="crypto-canvas min-h-screen w-full overflow-x-hidden">
          <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
            <EmptyState
              title="Kripto kotasyonları henüz yok"
              description="Bu kategoride henüz canlı fiyat bulunamadı. Piyasalar sayfasından tüm sembolleri görüntüleyebilirsiniz."
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
      <div className="crypto-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper min-w-0 py-16">
          <EmptyState
            title="Kripto önizleme kapalı"
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
    <div className="crypto-canvas min-h-screen w-full overflow-x-hidden">
      <div className="ms-container-markets ms-page-wrapper relative z-[1] flex flex-col gap-6 pb-20 pt-4">

        {zones.pulse ? <CryptoPulseBar pulse={data.phase1.pulse} /> : null}
        {zones.pulse ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.regime || zones.segments) ? (
          <div className="grid grid-cols-1 gap-8 min-[860px]:grid-cols-[1fr_minmax(0,340px)]">
            {zones.regime ? <CryptoRegimeDominance regime={data.phase1.regime} /> : null}
            {zones.segments && data.segments.segments.length > 0 ? (
              <CryptoSegmentHeatmap segments={data.segments} />
            ) : null}
          </div>
        ) : null}
        {(zones.regime || zones.segments) ? <div className="cc-divider" aria-hidden /> : null}

        {(zones.panels || zones.movers) ? (
          <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
            {zones.panels ? (
              <div className="min-[1000px]:col-span-2">
                <CryptoBtcEthPanels btc={data.phase1.btc} eth={data.phase1.eth} />
              </div>
            ) : null}
            {zones.movers ? <CryptoTopMovers movers={data.movers} /> : null}
          </div>
        ) : null}
        {(zones.panels || zones.movers) ? <div className="cc-divider" aria-hidden /> : null}

        {zones.bottomStrip ? (
          <>
            <CryptoBottomStrip strip={data.bottomStrip} />
            <div className="cc-divider" aria-hidden />
          </>
        ) : null}

        {zones.signals && data.signals.totalActiveSignals > 0 ? (
          <>
            <CryptoSignalStrip signals={data.signals} />
            <div className="cc-divider" aria-hidden />
          </>
        ) : null}

        {zones.screener ? <CryptoScreenerBoard screener={data.screener} /> : null}

      </div>
    </div>
  );
}
