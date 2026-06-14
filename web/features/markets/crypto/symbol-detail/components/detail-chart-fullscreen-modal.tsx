"use client";

import { createPortal } from "react-dom";

import { DetailChartTerminal } from "@/features/markets/crypto/symbol-detail/components/detail-chart-terminal";
import { useDetailChartModalChrome } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-chart-modal-chrome";
import type { ProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import { symbolAccentColor } from "@/features/markets/crypto/symbol-detail/lib/symbol-visuals";
import type { DetailChartMode, DetailChartTimeframe } from "@/features/markets/crypto/symbol-detail/lib/types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

type Props = {
  open: boolean;
  onClose: () => void;
  bundle: AssetIntelligenceBundle;
  mode: DetailChartMode;
  onModeChange: (mode: DetailChartMode) => void;
  timeframe: DetailChartTimeframe;
  onTimeframeChange: (tf: DetailChartTimeframe) => void;
  proSettings: ProChartSettings;
  onProSettingsChange: (next: ProChartSettings) => void;
};

export function DetailChartFullscreenModal({
  open,
  onClose,
  bundle,
  mode,
  onModeChange,
  timeframe,
  onTimeframeChange,
  proSettings,
  onProSettingsChange,
}: Props) {
  const mounted = useDetailChartModalChrome(open, onClose);
  const sym = bundle.asset.symbol.trim().toUpperCase();
  const accent = symbolAccentColor(sym);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="cdr-chart-modal-root motion-modal-enter"
      role="dialog"
      aria-modal="true"
      aria-label={`${sym} tam ekran grafik`}
    >
      <button type="button" className="cdr-chart-modal-backdrop motion-backdrop-enter" aria-label="Kapat" onClick={onClose} />
      <div
        className="cdr-chart-modal-panel cdr-chart-modal-panel--terminal"
        style={{ "--cdr-terminal-accent": accent } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <DetailChartTerminal
          bundle={bundle}
          mode={mode}
          onModeChange={onModeChange}
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          proSettings={proSettings}
          onProSettingsChange={onProSettingsChange}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body,
  );
}
