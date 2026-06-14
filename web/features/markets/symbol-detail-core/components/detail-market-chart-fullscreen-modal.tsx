"use client";

import { createPortal } from "react-dom";

import { defaultProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import { useDetailChartModalChrome } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-chart-modal-chrome";
import type { ProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import type { DetailKline } from "@/features/markets/crypto/symbol-detail/lib/types";
import { DetailMarketChartTerminal } from "@/features/markets/symbol-detail-core/components/detail-market-chart-terminal";
import type { MarketDetailChartMode } from "@/features/markets/symbol-detail-core/lib/detail-market-chart-constants";

type Props<T extends string> = {
  open: boolean;
  onClose: () => void;
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
  proSettings?: ProChartSettings;
  onProSettingsChange?: (next: ProChartSettings) => void;
};

export function DetailMarketChartFullscreenModal<T extends string>({
  open,
  onClose,
  symbolLabel,
  accentColor,
  candles,
  isPending,
  isError,
  timeframes,
  timeframeLabels,
  timeframe,
  onTimeframeChange,
  mode,
  onModeChange,
  proSettings,
  onProSettingsChange,
}: Props<T>) {
  const mounted = useDetailChartModalChrome(open, onClose);
  const settings = proSettings ?? defaultProChartSettings();
  const onSettingsChange = onProSettingsChange ?? (() => undefined);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="cdr-chart-modal-root motion-modal-enter"
      role="dialog"
      aria-modal="true"
      aria-label={`${symbolLabel} tam ekran grafik`}
    >
      <button type="button" className="cdr-chart-modal-backdrop motion-backdrop-enter" aria-label="Kapat" onClick={onClose} />
      <div
        className="cdr-chart-modal-panel cdr-chart-modal-panel--terminal"
        style={{ "--cdr-terminal-accent": accentColor } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <DetailMarketChartTerminal
          symbolLabel={symbolLabel}
          accentColor={accentColor}
          candles={candles}
          isPending={isPending}
          isError={isError}
          timeframes={timeframes}
          timeframeLabels={timeframeLabels}
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          mode={mode}
          onModeChange={onModeChange}
          proSettings={settings}
          onProSettingsChange={onSettingsChange}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body,
  );
}
