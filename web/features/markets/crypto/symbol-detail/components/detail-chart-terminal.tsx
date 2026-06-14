"use client";

import { useMemo, useRef, useState } from "react";

import { DetailCandlestickChart } from "@/features/markets/crypto/symbol-detail/components/detail-candlestick-chart";
import { DetailChartControlsOverlay } from "@/features/markets/crypto/symbol-detail/components/detail-chart-controls-overlay";
import { DetailProChart } from "@/features/markets/crypto/symbol-detail/components/detail-pro-chart";
import { useDetailKlines } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-klines";
import { useChartContainerSize } from "@/features/markets/crypto/symbol-detail/hooks/use-chart-container-size";
import type { ProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import { symbolAccentColor } from "@/features/markets/crypto/symbol-detail/lib/symbol-visuals";
import type { DetailChartMode, DetailChartTimeframe } from "@/features/markets/crypto/symbol-detail/lib/types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  mode: DetailChartMode;
  onModeChange: (mode: DetailChartMode) => void;
  timeframe: DetailChartTimeframe;
  onTimeframeChange: (tf: DetailChartTimeframe) => void;
  proSettings: ProChartSettings;
  onProSettingsChange: (next: ProChartSettings) => void;
  onClose: () => void;
};

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DetailChartTerminal({
  bundle,
  mode,
  onModeChange,
  timeframe,
  onTimeframeChange,
  proSettings,
  onProSettingsChange,
  onClose,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [fitRequest, setFitRequest] = useState(0);
  const sym = bundle.asset.symbol.trim().toUpperCase();
  const accent = useMemo(() => symbolAccentColor(sym), [sym]);
  const stageSize = useChartContainerSize(stageRef, 480, true);
  const { data, isPending, isError } = useDetailKlines(sym, timeframe);
  const candles = data?.candles ?? [];

  const terminalLayout = stageSize.ready
    ? { width: stageSize.width, height: stageSize.height }
    : undefined;

  const showCharts = Boolean(terminalLayout && candles.length >= 2);
  const overlayReserve = mode === "pro" ? 118 : 54;

  return (
    <div className="cdr-chart-terminal" style={{ "--cdr-terminal-accent": accent } as React.CSSProperties}>
      <div className="cdr-chart-terminal__frame">
        <div
          ref={stageRef}
          className="cdr-chart-terminal__stage"
          style={{ "--cdr-chart-overlay-reserve": `${overlayReserve}px` } as React.CSSProperties}
        >
          <div className="cdr-chart-terminal__hud">
            <button type="button" className="cdr-chart-terminal__close" aria-label="Kapat" onClick={onClose}>
              <IconClose />
            </button>

            <DetailChartControlsOverlay
              variant="terminal"
              mode={mode}
              onModeChange={onModeChange}
              timeframe={timeframe}
              onTimeframeChange={onTimeframeChange}
              showExpand={false}
              proSettings={proSettings}
              onProSettingsChange={onProSettingsChange}
              onFitContent={() => setFitRequest((n) => n + 1)}
              className="cdr-chart-terminal__controls"
            />
          </div>

          {isError && candles.length === 0 ? (
            <p className="cdr-chart-terminal__empty">Canlı mum verisi alınamadı.</p>
          ) : isPending && candles.length === 0 ? (
            <p className="cdr-chart-terminal__empty">Mum verisi yükleniyor…</p>
          ) : !terminalLayout ? (
            <div className="cdr-skeleton cdr-chart-terminal__skeleton" aria-hidden />
          ) : !showCharts ? (
            <div className="cdr-skeleton cdr-chart-terminal__skeleton" />
          ) : (
            <>
              <div
                className={cn(
                  "cdr-chart-terminal__pane",
                  mode !== "classic" && "cdr-chart-terminal__pane--hidden",
                )}
                aria-hidden={mode !== "classic"}
              >
                <DetailCandlestickChart
                  candles={candles}
                  accentColor={accent}
                  terminal
                  terminalLayout={terminalLayout}
                />
              </div>
              <div
                className={cn(
                  "cdr-chart-terminal__pane",
                  mode !== "pro" && "cdr-chart-terminal__pane--hidden",
                )}
                aria-hidden={mode !== "pro"}
              >
                <DetailProChart
                  candles={candles}
                  accentColor={accent}
                  terminal
                  terminalLayout={terminalLayout}
                  settings={proSettings}
                  onSettingsChange={onProSettingsChange}
                  fitRequest={fitRequest}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
