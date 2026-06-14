"use client";

import { useMemo, useState } from "react";

import {
  FOREX_CHART_TF_LABEL,
  FOREX_CHART_TIMEFRAMES,
  type ForexChartTimeframe,
} from "@/features/markets/forex/lib/forex-chart-types";
import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import { buildForexPairPanel } from "@/features/markets/forex/lib/forex-pair-panel-utils";
import { forexAccentFor, normalizeForexSymbol } from "@/features/markets/forex/lib/forex-symbol-meta";
import { useForexDetailKlines } from "@/features/markets/forex/symbol-detail/hooks/use-forex-detail-klines";
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

export function ForexDetailChartSection({ bundle, liveAsset }: Props) {
  const asset = liveAsset ?? bundle.asset;
  const panel = useMemo(() => buildForexPairPanel(asset), [asset]);
  const sym = normalizeForexSymbol(asset.symbol);
  const accent = forexAccentFor(sym);
  const [fullscreen, setFullscreen] = useState(false);
  const [mode, setMode] = useState<MarketDetailChartMode>("classic");
  const [timeframe, setTimeframe] = useState<ForexChartTimeframe>("1h");
  const [proSettings, setProSettings] = useState(defaultProChartSettings);

  const query = useForexDetailKlines(sym, timeframe);

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
    ? `Yahoo Finance · ${FOREX_CHART_TF_LABEL[timeframe]} · ${candles.length} mum`
    : null;

  return (
    <>
      <section className="cdr-section fx-chart-section" data-zone="chart" aria-label="Kur grafiği">
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
            timeframes={FOREX_CHART_TIMEFRAMES}
            timeframeLabels={FOREX_CHART_TF_LABEL}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            mode={mode}
            onModeChange={setMode}
            proSettings={proSettings}
            onProSettingsChange={setProSettings}
            formatPrice={(value) => formatForexTickerPrice(value, sym)}
            fallbackPrice={panel.rate}
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
        timeframes={FOREX_CHART_TIMEFRAMES}
        timeframeLabels={FOREX_CHART_TF_LABEL}
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
