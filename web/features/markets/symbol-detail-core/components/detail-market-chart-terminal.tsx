"use client";

import { useMemo, useRef, useState } from "react";

import { DetailCandlestickChart } from "@/features/markets/crypto/symbol-detail/components/detail-candlestick-chart";
import { DetailProChart } from "@/features/markets/crypto/symbol-detail/components/detail-pro-chart";
import { useChartContainerSize } from "@/features/markets/crypto/symbol-detail/hooks/use-chart-container-size";
import type { ProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import type { DetailKline } from "@/features/markets/crypto/symbol-detail/lib/types";
import { DetailMarketChartControlsOverlay } from "@/features/markets/symbol-detail-core/components/detail-market-chart-controls-overlay";
import type { MarketDetailChartMode } from "@/features/markets/symbol-detail-core/lib/detail-market-chart-constants";
import { cn } from "@/lib/cn";

type Props<T extends string> = {
  symbolLabel: string;
  accentColor: string;
  candles: DetailKline[];
  isPending?: boolean;
  isError?: boolean;
  timeframes: readonly T[];
  timeframeLabels: Record<T, string>;
  timeframe: T;
  onTimeframeChange: (tf: T) => void;
  mode: MarketDetailChartMode;
  onModeChange: (mode: MarketDetailChartMode) => void;
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

export function DetailMarketChartTerminal<T extends string>({
  symbolLabel,
  accentColor,
  candles,
  isPending = false,
  isError = false,
  timeframes,
  timeframeLabels,
  timeframe,
  onTimeframeChange,
  mode,
  onModeChange,
  proSettings,
  onProSettingsChange,
  onClose,
}: Props<T>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [fitRequest, setFitRequest] = useState(0);
  const accent = useMemo(() => accentColor, [accentColor]);
  const stageSize = useChartContainerSize(stageRef, 480, true);

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

            <DetailMarketChartControlsOverlay
              variant="terminal"
              mode={mode}
              onModeChange={onModeChange}
              timeframe={timeframe}
              onTimeframeChange={onTimeframeChange}
              timeframes={timeframes}
              timeframeLabels={timeframeLabels}
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
            <div className="cdr-skeleton cdr-chart-terminal__skeleton" aria-hidden />
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
      <span className="cdr-sr-only">{symbolLabel} tam ekran grafik</span>
    </div>
  );
}
