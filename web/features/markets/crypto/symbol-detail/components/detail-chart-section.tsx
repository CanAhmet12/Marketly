"use client";

import { useState } from "react";

import { DetailChartFullscreenModal } from "@/features/markets/crypto/symbol-detail/components/detail-chart-fullscreen-modal";
import { DetailChartPanel } from "@/features/markets/crypto/symbol-detail/components/detail-chart-panel";
import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { defaultProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import type { DetailChartMode, DetailChartTimeframe } from "@/features/markets/crypto/symbol-detail/lib/types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

type Props = {
  bundle: AssetIntelligenceBundle;
};

export function DetailChartSection({ bundle }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [mode, setMode] = useState<DetailChartMode>("classic");
  const [timeframe, setTimeframe] = useState<DetailChartTimeframe>("15m");
  const [proSettings, setProSettings] = useState(defaultProChartSettings);

  return (
    <>
      <section className="cdr-section" data-zone="chart" aria-label="Fiyat grafiği">
        <DetailSectionHead seriesKicker="Piyasa" label="Grafik & Likidite" accent="teal" />

        <div className="cdr-section-body">
          <DetailChartPanel
            bundle={bundle}
            mode={mode}
            onModeChange={setMode}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            proSettings={proSettings}
            onProSettingsChange={setProSettings}
            onExpand={() => setFullscreen(true)}
          />
        </div>
      </section>

      <DetailChartFullscreenModal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        bundle={bundle}
        mode={mode}
        onModeChange={setMode}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        proSettings={proSettings}
        onProSettingsChange={setProSettings}
      />
    </>
  );
}
