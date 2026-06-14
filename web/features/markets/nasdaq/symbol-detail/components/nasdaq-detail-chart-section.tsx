"use client";

import { useMemo, useState } from "react";

import {
  NASDAQ_CHART_TF_LABEL,
  NASDAQ_CHART_TIMEFRAMES,
  type NasdaqChartTimeframe,
} from "@/features/markets/nasdaq/lib/nasdaq-chart-types";
import { formatNasdaqTickerPrice } from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import { buildNasdaqIndexPanel } from "@/features/markets/nasdaq/lib/nasdaq-panel-utils";
import { nasdaqAccentFor } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { useNasdaqDetailKlines } from "@/features/markets/nasdaq/symbol-detail/hooks/use-nasdaq-detail-klines";
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

export function NasdaqDetailChartSection({ bundle, liveAsset }: Props) {
  const asset = liveAsset ?? bundle.asset;
  const panel = useMemo(() => buildNasdaqIndexPanel(asset), [asset]);
  const sym = asset.symbol.trim().toUpperCase();
  const accent = nasdaqAccentFor(sym);
  const [fullscreen, setFullscreen] = useState(false);
  const [mode, setMode] = useState<MarketDetailChartMode>("classic");
  const [timeframe, setTimeframe] = useState<NasdaqChartTimeframe>("1h");
  const [proSettings, setProSettings] = useState(defaultProChartSettings);

  const query = useNasdaqDetailKlines(sym, timeframe);

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

  const sourceNote = query.data
    ? `Yahoo Finance · ${NASDAQ_CHART_TF_LABEL[timeframe]} · ${candles.length} mum`
    : null;

  return (
    <>
      <section className="cdr-section nqx-chart-section" data-zone="chart" aria-label="Fiyat grafiği">
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
            timeframes={NASDAQ_CHART_TIMEFRAMES}
            timeframeLabels={NASDAQ_CHART_TF_LABEL}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            mode={mode}
            onModeChange={setMode}
            proSettings={proSettings}
            onProSettingsChange={setProSettings}
            formatPrice={(value) => formatNasdaqTickerPrice(value, sym)}
            fallbackPrice={panel.value}
            fallbackChangePct={panel.changePct}
            fallbackVolume={asset.volume ?? "—"}
            onExpand={() => setFullscreen(true)}
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
        timeframes={NASDAQ_CHART_TIMEFRAMES}
        timeframeLabels={NASDAQ_CHART_TF_LABEL}
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
