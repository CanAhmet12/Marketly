"use client";

import { useMemo, useState } from "react";

import { buildCommodityPanel } from "@/features/markets/commodities/lib/commodity-panel-utils";
import {
  COMMODITY_CHART_TF_LABEL,
  COMMODITY_CHART_TIMEFRAMES,
  type CommodityChartTimeframe,
} from "@/features/markets/commodities/lib/commodity-chart-types";
import { formatCommodityTickerPrice } from "@/features/markets/commodities/lib/map-commodity-tickers";
import { useCommodityDetailKlines } from "@/features/markets/commodities/symbol-detail/hooks/use-commodity-detail-klines";
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

const ACCENT = "#f97316";

export function CommodityDetailChartSection({ bundle, liveAsset }: Props) {
  const asset = liveAsset ?? bundle.asset;
  const panel = useMemo(() => buildCommodityPanel(asset), [asset]);
  const sym = asset.symbol.trim().toUpperCase();
  const [fullscreen, setFullscreen] = useState(false);
  const [mode, setMode] = useState<MarketDetailChartMode>("classic");
  const [timeframe, setTimeframe] = useState<CommodityChartTimeframe>("1h");
  const [proSettings, setProSettings] = useState(defaultProChartSettings);

  const query = useCommodityDetailKlines(sym, timeframe);

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
    ? `Yahoo Finance · ${COMMODITY_CHART_TF_LABEL[timeframe]} · ${candles.length} mum`
    : null;

  return (
    <>
      <section className="cdr-section cmr-chart-section" data-zone="chart" aria-label="Fiyat grafiği">
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
            accentColor={ACCENT}
            timeframes={COMMODITY_CHART_TIMEFRAMES}
            timeframeLabels={COMMODITY_CHART_TF_LABEL}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            mode={mode}
            onModeChange={setMode}
            proSettings={proSettings}
            onProSettingsChange={setProSettings}
            formatPrice={(value) => formatCommodityTickerPrice(value, sym)}
            fallbackPrice={panel.price}
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
        accentColor={ACCENT}
        candles={candles}
        isPending={query.isPending}
        isError={query.isError}
        timeframes={COMMODITY_CHART_TIMEFRAMES}
        timeframeLabels={COMMODITY_CHART_TF_LABEL}
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
