"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { MarketsPageClient } from "@/features/markets/markets-page-client";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { isMockDataEnabled } from "@/mock/config";

import { CryptoPulseBar }       from "@/features/markets/crypto/components/crypto-pulse-bar";
import { CryptoRegimeDominance } from "@/features/markets/crypto/components/crypto-regime-dominance";
import { CryptoSegmentHeatmap }  from "@/features/markets/crypto/components/crypto-segment-heatmap";
import { CryptoBtcEthPanels }   from "@/features/markets/crypto/components/crypto-btc-eth-panels";
import { CryptoTopMovers }      from "@/features/markets/crypto/components/crypto-top-movers";
import { CryptoSignalStrip }    from "@/features/markets/crypto/components/crypto-signal-strip";
import { CryptoScreenerBoard }  from "@/features/markets/crypto/components/crypto-screener-board";
import { CryptoBottomStrip }    from "@/features/markets/crypto/components/crypto-bottom-strip";

export function CryptoCategoryPageClient() {
  const mockOn = isMockDataEnabled();
  const repo   = useMemo(() => getMarketsRepository(), []);
  const data   = useMemo(() => repo.getCryptoCategoryDashboard(), [repo]);

  if (!data) {
    if (!mockOn) return <MarketsPageClient initialSegment="crypto" />;
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

        {/* Zone 0 — Pulse Bar */}
        <CryptoPulseBar pulse={data.phase1.pulse} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 1 — Regime + Segment */}
        <div className="grid grid-cols-1 gap-8 min-[860px]:grid-cols-[1fr_minmax(0,340px)]">
          <CryptoRegimeDominance regime={data.phase1.regime} />
          <CryptoSegmentHeatmap segments={data.segments} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 2 — BTC/ETH Paneller + Movers */}
        <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[1fr_1fr_minmax(0,260px)]">
          <div className="min-[1000px]:col-span-2">
            <CryptoBtcEthPanels btc={data.phase1.btc} eth={data.phase1.eth} />
          </div>
          <CryptoTopMovers movers={data.movers} />
        </div>

        <div className="cc-divider" aria-hidden />

        {/* Zone 3 — Bottom Strip */}
        <CryptoBottomStrip strip={data.bottomStrip} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 4 — Sinyal İstihbaratı */}
        <CryptoSignalStrip signals={data.signals} />

        <div className="cc-divider" aria-hidden />

        {/* Zone 5 — Kripto Tarayıcı */}
        <CryptoScreenerBoard screener={data.screener} />

      </div>
    </div>
  );
}
