"use client";

import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { useDetailMarketPulse } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-market-pulse";
import { useDetailSectionSurface } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-section-surface";
import { fmtPriceUsd, fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import type { MarketPulseReturnKey } from "@/features/markets/crypto/lib/crypto-market-pulse-types";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  variant?: "inline" | "wide";
};

const RETURN_ACCENTS: Record<MarketPulseReturnKey, string> = {
  "1h": "cdr-pulse__tile--1h",
  "24h": "cdr-pulse__tile--24h",
  "7d": "cdr-pulse__tile--7d",
  "30d": "cdr-pulse__tile--30d",
  "90d": "cdr-pulse__tile--90d",
};

export function DetailMarketPulseSection({ symbol, variant = "inline" }: Props) {
  const sym = symbol.trim().toUpperCase();
  const isInline = variant === "inline";
  const sectionClass = cn(
    "cdr-section cdr-pulse-section",
    isInline ? "cdr-pulse-section--inline" : "cdr-pulse-section--wide",
  );
  const query = useDetailMarketPulse(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className={sectionClass} data-zone="market-pulse">
        <DetailSectionHead seriesKicker="Performans" label="Piyasa Pulse" accent="live" />
        <div className="cdr-skeleton" style={{ height: isInline ? 280 : 320, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className={sectionClass} data-zone="market-pulse">
        <DetailSectionHead seriesKicker="Performans" label="Piyasa Pulse" accent="live" />
        <p className="cdr-section-stub">Piyasa pulse verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const pos = data.range24h.positionPct;

  return (
    <section className={sectionClass} data-zone="market-pulse" aria-label="Piyasa pulse">
      <DetailSectionHead
        seriesKicker={data.source === "binance" ? "Binance Spot" : "CoinGecko"}
        label="Piyasa Pulse"
        accent="live"
        trailing={
          <span className="cdr-pulse__live-tag">
            <span className="cdr-pulse__live-dot" aria-hidden />
            Canlı
          </span>
        }
      />

      <div className="cdr-pulse__canvas">
        <div className="cdr-pulse__returns" role="list">
          {data.returns.map((row) => {
            const up = row.changePct >= 0;
            return (
              <div
                key={row.key}
                className={cn("cdr-pulse__tile", RETURN_ACCENTS[row.key])}
                role="listitem"
              >
                <span className="cdr-pulse__tile-accent" aria-hidden />
                <div className="cdr-pulse__tile-body">
                  <span className="cdr-pulse__tile-k">{row.label}</span>
                  <span className={cn("cdr-pulse__tile-v", up ? "cdr-up" : "cdr-down")}>
                    {fmtSignedPct(row.changePct)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cdr-pulse__range">
          <div className="cdr-pulse__range-head">
            <span className="cdr-pulse__range-k">24s aralık</span>
            <span className="cdr-pulse__range-pos">{pos.toFixed(0)}% band içi</span>
          </div>
          <div className="cdr-pulse__range-track" aria-hidden>
            <span className="cdr-pulse__range-fill" style={{ width: `${pos}%` }} />
            <span className="cdr-pulse__range-marker" style={{ left: `${pos}%` }} />
          </div>
          <div className="cdr-pulse__range-labels">
            <span>{fmtPriceUsd(data.range24h.low)}</span>
            <span className="cdr-pulse__range-mid">{fmtPriceUsd(data.currentPrice)}</span>
            <span>{fmtPriceUsd(data.range24h.high)}</span>
          </div>
        </div>

        <div className="cdr-pulse__facts">
          <div className="cdr-pulse__fact cdr-pulse__fact--vol">
            <span className="cdr-pulse__fact-k">Volatilite (24s)</span>
            <span className="cdr-pulse__fact-v">{data.volatility24hPct.toFixed(2)}%</span>
          </div>
          <div className="cdr-pulse__fact cdr-pulse__fact--pivot">
            <span className="cdr-pulse__fact-k">Pivot</span>
            <span className="cdr-pulse__fact-v">{fmtPriceUsd(data.levels.pivot)}</span>
          </div>
          <div className="cdr-pulse__fact cdr-pulse__fact--support">
            <span className="cdr-pulse__fact-k">Destek</span>
            <span className="cdr-pulse__fact-v cdr-up">{fmtPriceUsd(data.levels.support)}</span>
          </div>
          <div className="cdr-pulse__fact cdr-pulse__fact--resist">
            <span className="cdr-pulse__fact-k">Direnç</span>
            <span className="cdr-pulse__fact-v cdr-down">{fmtPriceUsd(data.levels.resistance)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
