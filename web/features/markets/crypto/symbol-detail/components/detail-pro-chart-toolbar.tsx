"use client";

import type { ProChartIndicators, ProChartSettings, ProDrawTool } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import { cn } from "@/lib/cn";

type Props = {
  settings: ProChartSettings;
  onChange: (next: ProChartSettings) => void;
  layout?: "overlay-dock" | "terminal-dock";
  onFitContent?: () => void;
};

const DRAW_TOOLS: { id: ProDrawTool; icon: string; title: string }[] = [
  { id: "cursor", icon: "↖", title: "İmleç" },
  { id: "hline", icon: "─", title: "Yatay çizgi" },
  { id: "trend", icon: "╱", title: "Trend çizgisi (2 tık)" },
  { id: "vline", icon: "│", title: "Dikey işaret" },
];

const INDICATORS: { key: keyof ProChartIndicators; label: string }[] = [
  { key: "ema9", label: "EMA 9" },
  { key: "ema21", label: "EMA 21" },
  { key: "bollinger", label: "BB" },
  { key: "rsi", label: "RSI" },
  { key: "macd", label: "MACD" },
  { key: "volume", label: "Hacim" },
];

function ToolBtn({
  active,
  label,
  title,
  onClick,
  children,
  compact,
}: {
  active?: boolean;
  label?: string;
  title: string;
  onClick: () => void;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "cdr-pro-toolbar__btn",
        compact && "cdr-pro-toolbar__btn--compact",
        active && "cdr-pro-toolbar__btn--active",
      )}
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
    >
      {children ?? label}
    </button>
  );
}

function toggleIndicator(settings: ProChartSettings, key: keyof ProChartIndicators): ProChartSettings {
  return {
    ...settings,
    indicators: {
      ...settings.indicators,
      [key]: !settings.indicators[key],
    },
  };
}

export function DetailProChartToolbar({
  settings,
  onChange,
  layout = "overlay-dock",
  onFitContent,
}: Props) {
  const setTool = (drawTool: ProDrawTool) => onChange({ ...settings, drawTool });
  const isTerminal = layout === "terminal-dock";
  const drawingCount =
    settings.drawings.hlines.length + settings.drawings.trends.length + settings.drawings.vlines.length;

  return (
    <div
      className={cn(
        "cdr-pro-toolbar",
        isTerminal ? "cdr-pro-toolbar--terminal-dock" : "cdr-pro-toolbar--overlay-dock",
      )}
      role="toolbar"
      aria-label="Pro grafik araçları"
    >
      <div className="cdr-pro-toolbar__section">
        <span className="cdr-pro-toolbar__section-k">Çizim</span>
        <div className="cdr-pro-toolbar__section-body">
          {DRAW_TOOLS.map((tool) => (
            <ToolBtn
              key={tool.id}
              compact
              active={settings.drawTool === tool.id}
              title={tool.title}
              onClick={() => setTool(tool.id)}
            >
              {tool.icon}
            </ToolBtn>
          ))}
          <ToolBtn
            compact
            title="Tüm çizimleri temizle"
            onClick={() =>
              onChange({
                ...settings,
                drawings: { hlines: [], trends: [], vlines: [] },
              })
            }
          >
            ⌫
          </ToolBtn>
          {drawingCount > 0 ? (
            <span className="cdr-pro-toolbar__badge" aria-label={`${drawingCount} çizim`}>
              {drawingCount}
            </span>
          ) : null}
        </div>
      </div>

      <div className="cdr-pro-toolbar__divider" aria-hidden />

      <div className="cdr-pro-toolbar__section cdr-pro-toolbar__section--grow">
        <span className="cdr-pro-toolbar__section-k">İndikatör</span>
        <div className="cdr-pro-toolbar__section-body cdr-pro-toolbar__chips">
          {INDICATORS.map(({ key, label }) => (
            <ToolBtn
              key={key}
              compact
              active={settings.indicators[key]}
              title={`${label} ${settings.indicators[key] ? "kapat" : "aç"}`}
              onClick={() => onChange(toggleIndicator(settings, key))}
              label={label}
            />
          ))}
        </div>
      </div>

      <div className="cdr-pro-toolbar__divider" aria-hidden />

      <div className="cdr-pro-toolbar__section">
        <span className="cdr-pro-toolbar__section-k">Araç</span>
        <div className="cdr-pro-toolbar__section-body">
          <ToolBtn
            compact
            active={settings.magnetCrosshair}
            title="Crosshair mıknatısı"
            onClick={() => onChange({ ...settings, magnetCrosshair: !settings.magnetCrosshair })}
            label="Magnet"
          />
          {onFitContent ? (
            <ToolBtn compact title="Grafiği sığdır" onClick={onFitContent} label="Sığdır" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
