"use client";

import { useMemo, useState } from "react";

import { CryptoDetailCandleChart } from "@/features/markets/crypto/detail/components/crypto-detail-candle-chart";
import { useCryptoChartData } from "@/features/markets/crypto/detail/hooks/use-crypto-chart-data";
import {
  CRYPTO_COMPARE_CANDIDATES,
  computeRangeStats,
  formatChartPrice,
} from "@/features/markets/crypto/detail/lib/crypto-chart-utils";
import { CRYPTO_CHART_RANGES } from "@/features/markets/crypto/detail/lib/crypto-chart-types";
import type { CryptoChartRangeId } from "@/features/markets/crypto/detail/lib/crypto-chart-types";
import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

const FEATURED_CHART_HEIGHT = 480;

type Props = {
  bundle: AssetIntelligenceBundle;
  featured?: boolean;
  integrated?: boolean;
  /** ad-canvas layout — başlık üst bölümde, toolbar sadece TF */
  adLayout?: boolean;
};

function rangeLabel(id: CryptoChartRangeId): string {
  const match = CRYPTO_CHART_RANGES.find((r) => r.id === id);
  if (!match) return id;
  if (match.id === "1G") return "Son 24 saat";
  if (match.id === "7G") return "Son 7 gün";
  if (match.id === "1A") return "Son 30 gün";
  if (match.id === "3A") return "Son 90 gün";
  return "Son 1 yıl";
}

export function CryptoDetailChartWorkbench({
  bundle,
  featured = false,
  integrated = false,
  adLayout = false,
}: Props) {
  const { asset } = bundle;
  const [rangeId, setRangeId] = useState<CryptoChartRangeId>("7G");
  const [compare, setCompare] = useState<string | null>(null);

  const activeRange = useMemo(
    () => CRYPTO_CHART_RANGES.find((r) => r.id === rangeId) ?? CRYPTO_CHART_RANGES[1]!,
    [rangeId],
  );

  const days = activeRange.days;

  const compareCandidates = useMemo(
    () => CRYPTO_COMPARE_CANDIDATES.filter((s) => s !== asset.symbol.toUpperCase()),
    [asset.symbol],
  );

  const { candles, compareCandles, source, compareSource, isLoading, error } = useCryptoChartData({
    symbol: asset.symbol,
    rangeId,
    price: asset.price,
    changePercent: asset.change_percent,
    compareSymbol: compare,
  });

  const stats = useMemo(() => computeRangeStats(candles), [candles]);

  const ohlc = useMemo(() => {
    if (!candles.length) return null;
    const first = candles[0]!;
    const last = candles[candles.length - 1]!;
    return {
      open: first.open,
      close: last.close,
      count: candles.length,
    };
  }, [candles]);

  const sourceLabel = source === "coingecko" ? "CoinGecko OHLC" : "Sentetik fallback veri";

  const chartHeight = featured ? FEATURED_CHART_HEIGHT : 360;

  return (
    <section
      className={cn(
        "cd-chart-workbench",
        featured && "cd-chart-workbench--featured",
        integrated && "cd-chart-workbench--integrated",
        adLayout && "cd-chart-workbench--ad",
      )}
      role="region"
      aria-label="Grafik terminali"
    >
      <div className={cn("cd-chart-toolbar", adLayout && "cd-chart-toolbar--ad")}>
        {!adLayout ? (
          <div className="cd-chart-toolbar-main">
            <h2 className="cd-chart-zone-title">Grafik terminali</h2>
            <p className="cd-chart-zone-sub">
              {asset.symbol} · {rangeLabel(rangeId)} · {sourceLabel}
            </p>
          </div>
        ) : (
          <p className="cd-chart-zone-sub cd-chart-zone-sub--ad">
            {asset.symbol} · {rangeLabel(rangeId)} · {sourceLabel}
          </p>
        )}

        <div className="cd-deck-toolbar-controls">
          <div className="cd-chart-tf-row" role="tablist" aria-label="Zaman aralığı">
            {CRYPTO_CHART_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={rangeId === r.id}
                className={cn("cd-chart-tf-btn", rangeId === r.id && "cd-chart-tf-btn--active")}
                onClick={() => setRangeId(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {stats && ohlc ? (
        <dl className="cd-chart-stats-strip" aria-label="Seçili dönem istatistikleri">
          <div className="cd-chart-stat-cell">
            <dt>Açılış</dt>
            <dd>${formatChartPrice(ohlc.open)}</dd>
          </div>
          <div className="cd-chart-stat-cell">
            <dt>Kapanış</dt>
            <dd>${formatChartPrice(ohlc.close)}</dd>
          </div>
          <div className="cd-chart-stat-cell">
            <dt>Yüksek</dt>
            <dd className="cc-up">${formatChartPrice(stats.high)}</dd>
          </div>
          <div className="cd-chart-stat-cell">
            <dt>Düşük</dt>
            <dd className="cc-down">${formatChartPrice(stats.low)}</dd>
          </div>
          <div className="cd-chart-stat-cell">
            <dt>Dönem</dt>
            <dd className={cn(stats.changePct >= 0 ? "cc-up" : "cc-down")}>
              {formatSignedChangePercent(stats.changePct)}
            </dd>
          </div>
          <div className="cd-chart-stat-cell">
            <dt>Hacim</dt>
            <dd>{stats.volumeLabel}</dd>
          </div>
          <div className="cd-chart-stat-cell cd-chart-stat-cell--meta">
            <dt>Mum</dt>
            <dd>{ohlc.count}</dd>
          </div>
        </dl>
      ) : isLoading ? (
        <p className="cd-chart-stats-loading" aria-live="polite">
          Grafik verisi yükleniyor…
        </p>
      ) : null}

      <div className="cd-chart-stage">
        <div className="cd-chart-stage-meta">
          <div className="cd-chart-stage-badges">
            {compare ? (
              <span className="cd-chart-legend cd-chart-legend--compare">
                <span className="cd-chart-legend-swatch cd-chart-legend-swatch--compare" aria-hidden />
                {compare} normalize
              </span>
            ) : null}
            <span className="cd-chart-legend cd-chart-legend--primary">
              <span className="cd-chart-legend-swatch cd-chart-legend-swatch--up" aria-hidden />
              {asset.symbol}
            </span>
          </div>
          {error ? <span className="cd-chart-error">{error}</span> : null}
        </div>

        <CryptoDetailCandleChart
          candles={candles}
          compareCandles={compareCandles}
          compareSymbol={compare}
          days={days}
          height={chartHeight}
          loading={isLoading && candles.length === 0}
          featured={featured}
        />
      </div>

      <div className="cd-chart-compare-row">
        <span className="cd-chart-compare-label">Karşılaştır</span>
        <div className="cd-chart-compare-chips" role="group" aria-label="Karşılaştırma sembolleri">
          {compareCandidates.map((sym) => (
            <button
              key={sym}
              type="button"
              className={cn("cd-chart-compare-chip", compare === sym && "cd-chart-compare-chip--active")}
              onClick={() => setCompare(compare === sym ? null : sym)}
              aria-pressed={compare === sym}
            >
              {sym}
            </button>
          ))}
        </div>
        {compare ? (
          <span className="cd-chart-compare-hint">
            {compare} · {compareSource === "coingecko" ? "canlı" : "fallback"}
          </span>
        ) : (
          <span className="cd-chart-compare-hint cd-chart-compare-hint--muted">
            İki varlığın dönem performansını üst üste gör
          </span>
        )}
      </div>
    </section>
  );
}
