"use client";

import { useMemo, useState } from "react";

import { DetailLiquidityPanel } from "@/features/markets/crypto/symbol-detail/components/detail-liquidity-panel";
import { DetailCandlestickChart } from "@/features/markets/crypto/symbol-detail/components/detail-candlestick-chart";
import { DetailChartControlsOverlay } from "@/features/markets/crypto/symbol-detail/components/detail-chart-controls-overlay";
import { DetailProChart } from "@/features/markets/crypto/symbol-detail/components/detail-pro-chart";
import { useDetailKlines } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-klines";
import {
  fmtCompactUsd,
  fmtPriceUsd,
  fmtSignedPct,
} from "@/features/markets/crypto/symbol-detail/lib/format";
import { symbolAccentColor } from "@/features/markets/crypto/symbol-detail/lib/symbol-visuals";
import type { ProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import type { DetailChartMode, DetailChartTimeframe, DetailChartView } from "@/features/markets/crypto/symbol-detail/lib/types";
import {
  DETAIL_CHART_INLINE_HEIGHT,
  DETAIL_CHART_VIEW_LABEL,
  DETAIL_CHART_VIEWS,
} from "@/features/markets/crypto/symbol-detail/lib/types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  mode: DetailChartMode;
  onModeChange: (mode: DetailChartMode) => void;
  timeframe: DetailChartTimeframe;
  onTimeframeChange: (tf: DetailChartTimeframe) => void;
  chartHeight?: number;
  showExpand?: boolean;
  onExpand?: () => void;
  proSettings?: ProChartSettings;
  onProSettingsChange?: (next: ProChartSettings) => void;
  className?: string;
};

export function DetailChartPanel({
  bundle,
  mode,
  onModeChange,
  timeframe,
  onTimeframeChange,
  chartHeight = DETAIL_CHART_INLINE_HEIGHT,
  showExpand = true,
  onExpand,
  proSettings,
  onProSettingsChange,
  className,
}: Props) {
  const sym = bundle.asset.symbol.trim().toUpperCase();
  const accent = symbolAccentColor(sym);
  const [view, setView] = useState<DetailChartView>("chart");

  const { data, isPending, isError } = useDetailKlines(sym, timeframe);
  const candles = data?.candles ?? [];
  const [fitRequest, setFitRequest] = useState(0);

  const stats = useMemo(() => {
    if (candles.length < 2) {
      return {
        open: bundle.asset.price,
        high: bundle.asset.price,
        low: bundle.asset.price,
        close: bundle.asset.price,
        change: bundle.asset.change_percent,
        volume: bundle.asset.volume ?? "—",
      };
    }
    const first = candles[0]!;
    const last = candles[candles.length - 1]!;
    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));
    const change = first.open !== 0 ? ((last.close - first.open) / first.open) * 100 : 0;
    return {
      open: first.open,
      high,
      low,
      close: last.close,
      change,
      volume: bundle.asset.volume ?? fmtCompactUsd(last.close * last.volume),
    };
  }, [candles, bundle.asset]);

  const overlayReserve = mode === "pro" ? 96 : 52;
  const stageHeight = chartHeight - overlayReserve;

  return (
    <div className={cn("cdr-chart-panel", className)}>
      <div className="cdr-chart-view-tabs" role="tablist" aria-label="Grafik görünümü">
        {DETAIL_CHART_VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            data-view={v}
            className={cn("cdr-chart-view-tab", view === v && "cdr-chart-view-tab--active")}
            onClick={() => setView(v)}
          >
            {DETAIL_CHART_VIEW_LABEL[v]}
          </button>
        ))}
      </div>

      {view === "liquidity" ? (
        <DetailLiquidityPanel symbol={sym} minHeight={chartHeight} />
      ) : (
        <>
      <div className="cdr-chart-card__stats" role="list">
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Açılış</span>
          <span className="cdr-chart-card__stat-v">{fmtPriceUsd(stats.open)}</span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Yüksek</span>
          <span className="cdr-chart-card__stat-v cdr-up">{fmtPriceUsd(stats.high)}</span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Düşük</span>
          <span className="cdr-chart-card__stat-v cdr-down">{fmtPriceUsd(stats.low)}</span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Kapanış</span>
          <span className="cdr-chart-card__stat-v">{fmtPriceUsd(stats.close)}</span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Değişim</span>
          <span className={cn("cdr-chart-card__stat-v", stats.change >= 0 ? "cdr-up" : "cdr-down")}>
            {fmtSignedPct(stats.change)}
          </span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Hacim</span>
          <span className="cdr-chart-card__stat-v">{stats.volume}</span>
        </div>
      </div>

      {isError && candles.length === 0 ? (
        <p className="cdr-chart-card__note">Canlı mum verisi alınamadı.</p>
      ) : null}
      {isPending && candles.length === 0 ? (
        <p className="cdr-chart-card__note">Mum verisi yükleniyor…</p>
      ) : null}

      {candles.length >= 2 ? (
        <div
          className={cn("cdr-chart-frame", mode === "pro" && "cdr-chart-frame--pro")}
          style={
            {
              "--cdr-chart-overlay-reserve": `${overlayReserve}px`,
              "--cdr-chart-stage-h": `${stageHeight}px`,
            } as React.CSSProperties
          }
        >
          <DetailChartControlsOverlay
            mode={mode}
            onModeChange={onModeChange}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            showExpand={showExpand}
            onExpand={onExpand}
            proSettings={proSettings}
            onProSettingsChange={onProSettingsChange}
            onFitContent={() => setFitRequest((n) => n + 1)}
          />

          <div className={cn("cdr-chart-stage", mode === "pro" && "cdr-chart-stage--pro")}>
            {mode === "classic" ? (
              <DetailCandlestickChart
                key={`classic-${timeframe}`}
                candles={candles}
                accentColor={accent}
                stageHeight={stageHeight}
              />
            ) : proSettings ? (
              <DetailProChart
                key={`pro-${timeframe}`}
                candles={candles}
                accentColor={accent}
                stageHeight={stageHeight}
                settings={proSettings}
                onSettingsChange={onProSettingsChange}
                fitRequest={fitRequest}
              />
            ) : null}
            {mode === "classic" ? <div className="cdr-chart-stage__fade" aria-hidden /> : null}
          </div>
        </div>
      ) : (
        <div className="cdr-chart-card__canvas">
          <div className="cdr-skeleton" style={{ height: chartHeight, borderRadius: 0 }} />
        </div>
      )}
        </>
      )}
    </div>
  );
}
