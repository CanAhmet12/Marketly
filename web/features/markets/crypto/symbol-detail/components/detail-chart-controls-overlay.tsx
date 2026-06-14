"use client";

import { IconExpand } from "@/features/markets/crypto/symbol-detail/components/detail-icons";
import { DetailProChartToolbar } from "@/features/markets/crypto/symbol-detail/components/detail-pro-chart-toolbar";
import type { ProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import type { DetailChartMode, DetailChartTimeframe } from "@/features/markets/crypto/symbol-detail/lib/types";
import {
  DETAIL_CHART_MODE_LABEL,
  DETAIL_CHART_MODES,
  DETAIL_CHART_TF_LABEL,
  DETAIL_CHART_TIMEFRAMES,
} from "@/features/markets/crypto/symbol-detail/lib/types";
import { cn } from "@/lib/cn";

type Props = {
  mode: DetailChartMode;
  onModeChange: (mode: DetailChartMode) => void;
  timeframe: DetailChartTimeframe;
  onTimeframeChange: (tf: DetailChartTimeframe) => void;
  showExpand?: boolean;
  onExpand?: () => void;
  proSettings?: ProChartSettings;
  onProSettingsChange?: (next: ProChartSettings) => void;
  variant?: "inline" | "terminal";
  onFitContent?: () => void;
  className?: string;
};

export function DetailChartControlsOverlay({
  mode,
  onModeChange,
  timeframe,
  onTimeframeChange,
  showExpand = true,
  onExpand,
  proSettings,
  onProSettingsChange,
  variant = "inline",
  onFitContent,
  className,
}: Props) {
  const isTerminal = variant === "terminal";
  const showProDock = mode === "pro" && proSettings && onProSettingsChange;

  return (
    <div
      className={cn(
        "cdr-chart-overlay",
        isTerminal && "cdr-chart-overlay--terminal",
        className,
      )}
      aria-label="Grafik kontrolleri"
    >
      <div className="cdr-chart-overlay__bar">
        <div className="cdr-chart-card__mode-tabs" role="tablist" aria-label="Grafik modu">
          {DETAIL_CHART_MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={cn("cdr-chart-card__mode-tab", mode === m && "cdr-chart-card__mode-tab--active")}
              onClick={() => onModeChange(m)}
            >
              {DETAIL_CHART_MODE_LABEL[m]}
            </button>
          ))}
        </div>

        <div className="cdr-chart-overlay__spacer" aria-hidden />

        <div
          className={cn(
            "cdr-chart-card__tabs cdr-chart-card__tabs--tf",
            isTerminal && "cdr-chart-overlay__tf",
          )}
          role="tablist"
          aria-label="Zaman dilimi"
        >
          {DETAIL_CHART_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              role="tab"
              aria-selected={timeframe === tf}
              className={cn("cdr-chart-card__tab", timeframe === tf && "cdr-chart-card__tab--active")}
              onClick={() => onTimeframeChange(tf)}
            >
              {DETAIL_CHART_TF_LABEL[tf]}
            </button>
          ))}
        </div>

        {showExpand && onExpand ? (
          <button
            type="button"
            className="cdr-chart-card__expand cdr-chart-overlay__expand"
            aria-label="Tam ekran grafik"
            onClick={onExpand}
          >
            <IconExpand size={16} />
            <span>Tam ekran</span>
          </button>
        ) : null}
      </div>

      {showProDock ? (
        <DetailProChartToolbar
          settings={proSettings}
          onChange={onProSettingsChange}
          layout={isTerminal ? "terminal-dock" : "overlay-dock"}
          onFitContent={onFitContent}
        />
      ) : null}
    </div>
  );
}
