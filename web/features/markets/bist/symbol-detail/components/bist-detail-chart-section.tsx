"use client";

import { useMemo, useState } from "react";

import {
  BIST_CHART_TF_LABEL,
  BIST_CHART_TIMEFRAMES,
  type BistChartTimeframe,
} from "@/features/markets/bist/lib/bist-chart-types";
import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import { buildBistDetailPanel } from "@/features/markets/bist/lib/bist-panel-utils";
import {
  bistAccentFor,
  isBistIndexSymbol,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { useBistDetailKlines } from "@/features/markets/bist/symbol-detail/hooks/use-bist-detail-klines";
import { defaultProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import type { DetailKline } from "@/features/markets/crypto/symbol-detail/lib/types";
import { DetailMarketChartFullscreenModal } from "@/features/markets/symbol-detail-core/components/detail-market-chart-fullscreen-modal";
import { DetailMarketChartPanel } from "@/features/markets/symbol-detail-core/components/detail-market-chart-panel";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { MarketDetailChartMode } from "@/features/markets/symbol-detail-core/lib/detail-market-chart-constants";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

type Props = {
  bundle: AssetIntelligenceBundle;
  liveAsset?: MarketAssetView | null;
};

export function BistDetailChartSection({ bundle, liveAsset }: Props) {
  const asset = liveAsset ?? bundle.asset;
  const sym = normalizeBistSymbol(asset.symbol);
  const panel = useMemo(() => buildBistDetailPanel(asset, sym), [asset, sym]);
  const accent = bistAccentFor(sym);
  const isIndex = isBistIndexSymbol(sym);
  const [fullscreen, setFullscreen] = useState(false);
  const [mode, setMode] = useState<MarketDetailChartMode>("classic");
  const [timeframe, setTimeframe] = useState<BistChartTimeframe>("1h");
  const [proSettings, setProSettings] = useState(defaultProChartSettings);

  const query = useBistDetailKlines(sym, timeframe);

  const candles: DetailKline[] = useMemo(
    () =>
      (query.data?.candles ?? []).map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      })),
    [query.data?.candles],
  );

  const xu100Correlation = query.data?.xu100Correlation ?? null;
  const correlationLabel = query.data?.correlationLabel ?? null;
  const sourceNote = query.data
    ? `Yahoo Finance · ${BIST_CHART_TF_LABEL[timeframe]} · ${candles.length} mum${
        !isIndex && correlationLabel ? ` · ${correlationLabel}` : ""
      }`
    : null;

  return (
    <>
      <section className="cdr-section bc-chart-section" data-zone="chart" aria-label="Fiyat grafiği">
        <DetailSectionHead
          seriesKicker={query.data?.ticker ? `Yahoo · ${query.data.ticker}` : "Piyasa"}
          label="Grafik & Likidite"
          accent="teal"
          trailing={
            query.data ? (
              <span className="cdr-live-pill cdr-live-pill--on">
                <span className="cdr-live-pill__dot cdr-live-pill__dot--pulse" aria-hidden />
                <span className="cdr-live-pill__text">Canlı</span>
              </span>
            ) : null
          }
        />

        <div className="cdr-section-body">
          <DetailMarketChartPanel
            candles={candles}
            isPending={query.isPending}
            isError={query.isError}
            accentColor={accent}
            timeframes={BIST_CHART_TIMEFRAMES}
            timeframeLabels={BIST_CHART_TF_LABEL}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            mode={mode}
            onModeChange={setMode}
            proSettings={proSettings}
            onProSettingsChange={setProSettings}
            formatPrice={(value) => formatBistTickerPrice(value, sym)}
            fallbackPrice={panel.value}
            fallbackChangePct={panel.changePct}
            fallbackVolume={asset.volume ?? "—"}
            onExpand={() => setFullscreen(true)}
            quoteBadge={
              !isIndex && xu100Correlation != null ? (
                <span className="bc-chart-section__corr" title={correlationLabel ?? undefined}>
                  XU100 · {xu100Correlation.toFixed(2)}
                </span>
              ) : null
            }
            sourceNote={sourceNote}
          />
        </div>
      </section>

      <DetailMarketChartFullscreenModal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        symbolLabel={sym}
        accentColor={accent}
        candles={candles}
        isPending={query.isPending}
        isError={query.isError}
        timeframes={BIST_CHART_TIMEFRAMES}
        timeframeLabels={BIST_CHART_TF_LABEL}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        mode={mode}
        onModeChange={setMode}
        proSettings={proSettings}
        onProSettingsChange={setProSettings}
      />
    </>
  );
}
