"use client";

import { useMemo, useState, type ReactNode } from "react";

import { DetailCandlestickChart } from "@/features/markets/crypto/symbol-detail/components/detail-candlestick-chart";
import { DetailProChart } from "@/features/markets/crypto/symbol-detail/components/detail-pro-chart";
import type { ProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import type { DetailKline } from "@/features/markets/crypto/symbol-detail/lib/types";
import { DetailMarketChartControlsOverlay } from "@/features/markets/symbol-detail-core/components/detail-market-chart-controls-overlay";
import {
  fmtMarketCompactVolume,
  fmtMarketSignedPct,
  MARKET_DETAIL_CHART_INLINE_HEIGHT,
  type MarketDetailChartMode,
} from "@/features/markets/symbol-detail-core/lib/detail-market-chart-constants";
import { cn } from "@/lib/cn";

type Props<T extends string> = {
  candles: DetailKline[];
  isPending?: boolean;
  isError?: boolean;
  accentColor: string;
  timeframes: readonly T[];
  timeframeLabels: Record<T, string>;
  timeframe: T;
  onTimeframeChange: (tf: T) => void;
  mode: MarketDetailChartMode;
  onModeChange: (mode: MarketDetailChartMode) => void;
  proSettings: ProChartSettings;
  onProSettingsChange: (next: ProChartSettings) => void;
  formatPrice: (value: number) => string;
  formatVolume?: (value: number) => string;
  fallbackPrice?: number;
  fallbackChangePct?: number;
  fallbackVolume?: string;
  chartHeight?: number;
  showExpand?: boolean;
  onExpand?: () => void;
  quoteBadge?: ReactNode;
  sourceNote?: string | null;
  className?: string;
};

export function DetailMarketChartPanel<T extends string>({
  candles,
  isPending = false,
  isError = false,
  accentColor,
  timeframes,
  timeframeLabels,
  timeframe,
  onTimeframeChange,
  mode,
  onModeChange,
  proSettings,
  onProSettingsChange,
  formatPrice,
  formatVolume = fmtMarketCompactVolume,
  fallbackPrice = 0,
  fallbackChangePct = 0,
  fallbackVolume = "—",
  chartHeight = MARKET_DETAIL_CHART_INLINE_HEIGHT,
  showExpand = true,
  onExpand,
  quoteBadge,
  sourceNote,
  className,
}: Props<T>) {
  const [fitRequest, setFitRequest] = useState(0);

  const stats = useMemo(() => {
    if (candles.length < 2) {
      return {
        open: fallbackPrice,
        high: fallbackPrice,
        low: fallbackPrice,
        close: fallbackPrice,
        change: fallbackChangePct,
        volume: fallbackVolume,
      };
    }

    const first = candles[0]!;
    const last = candles[candles.length - 1]!;
    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));
    const change = first.open !== 0 ? ((last.close - first.open) / first.open) * 100 : fallbackChangePct;
    const volSum = candles.reduce((s, c) => s + (c.volume ?? 0), 0);

    return {
      open: first.open,
      high,
      low,
      close: last.close,
      change,
      volume: volSum > 0 ? formatVolume(volSum) : fallbackVolume,
    };
  }, [candles, fallbackChangePct, fallbackPrice, fallbackVolume, formatVolume]);

  const overlayReserve = mode === "pro" ? 96 : 52;
  const stageHeight = chartHeight - overlayReserve;
  const showChart = candles.length >= 2;

  return (
    <div className={cn("cdr-chart-panel", className)}>
      {quoteBadge ? <div className="cdr-market-chart__quote-extra">{quoteBadge}</div> : null}

      <div className="cdr-chart-card__stats" role="list">
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Açılış</span>
          <span className="cdr-chart-card__stat-v">{formatPrice(stats.open)}</span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Yüksek</span>
          <span className="cdr-chart-card__stat-v cdr-up">{formatPrice(stats.high)}</span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Düşük</span>
          <span className="cdr-chart-card__stat-v cdr-down">{formatPrice(stats.low)}</span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Kapanış</span>
          <span className="cdr-chart-card__stat-v">{formatPrice(stats.close)}</span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Değişim</span>
          <span className={cn("cdr-chart-card__stat-v", stats.change >= 0 ? "cdr-up" : "cdr-down")}>
            {fmtMarketSignedPct(stats.change)}
          </span>
        </div>
        <div className="cdr-chart-card__stat" role="listitem">
          <span className="cdr-chart-card__stat-k">Hacim</span>
          <span className="cdr-chart-card__stat-v">{stats.volume}</span>
        </div>
      </div>

      {isError && !showChart ? (
        <p className="cdr-chart-card__note">Canlı mum verisi alınamadı.</p>
      ) : null}
      {isPending && !showChart ? (
        <p className="cdr-chart-card__note">Mum verisi yükleniyor…</p>
      ) : null}

      {showChart ? (
        <div
          className={cn("cdr-chart-frame", mode === "pro" && "cdr-chart-frame--pro")}
          style={
            {
              "--cdr-chart-overlay-reserve": `${overlayReserve}px`,
              "--cdr-chart-stage-h": `${stageHeight}px`,
            } as React.CSSProperties
          }
        >
          <DetailMarketChartControlsOverlay
            mode={mode}
            onModeChange={onModeChange}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            timeframes={timeframes}
            timeframeLabels={timeframeLabels}
            showExpand={showExpand}
            onExpand={onExpand}
            proSettings={proSettings}
            onProSettingsChange={onProSettingsChange}
            onFitContent={() => setFitRequest((n) => n + 1)}
          />

          <div className={cn("cdr-chart-stage", mode === "pro" && "cdr-chart-stage--pro")}>
            {mode === "classic" ? (
              <DetailCandlestickChart
                key={`classic-${String(timeframe)}`}
                candles={candles}
                accentColor={accentColor}
                stageHeight={stageHeight}
              />
            ) : (
              <DetailProChart
                key={`pro-${String(timeframe)}`}
                candles={candles}
                accentColor={accentColor}
                stageHeight={stageHeight}
                settings={proSettings}
                onSettingsChange={onProSettingsChange}
                fitRequest={fitRequest}
              />
            )}
            {mode === "classic" ? <div className="cdr-chart-stage__fade" aria-hidden /> : null}
          </div>
        </div>
      ) : (
        <div className="cdr-chart-card__canvas">
          <div className="cdr-skeleton" style={{ height: chartHeight, borderRadius: 0 }} aria-hidden />
        </div>
      )}

      {sourceNote ? <p className="cdr-chart-card__note cdr-market-chart__source">{sourceNote}</p> : null}
    </div>
  );
}
