"use client";

import { formatCommodityTickerPrice } from "@/features/markets/commodities/lib/map-commodity-tickers";
import type { CommodityPulseReturnKey } from "@/features/markets/commodities/lib/commodity-detail-types";
import { useCommodityDetailMarketPulse } from "@/features/markets/commodities/symbol-detail/hooks/use-commodity-market-pulse";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  changePct?: number;
};

const RETURN_ACCENTS: Record<CommodityPulseReturnKey, string> = {
  "1h": "cdr-pulse__tile--1h",
  "24h": "cdr-pulse__tile--24h",
  "7d": "cdr-pulse__tile--7d",
  "30d": "cdr-pulse__tile--30d",
  "90d": "cdr-pulse__tile--90d",
};

function fmtPrice(price: number, symbol: string): string {
  return formatCommodityTickerPrice(price, symbol);
}

export function CommodityDetailPulseSection({ symbol, changePct }: Props) {
  const sym = symbol.trim().toUpperCase();
  const query = useCommodityDetailMarketPulse(sym, changePct);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-pulse-section cdr-pulse-section--inline" data-zone="pulse">
        <DetailSectionHead seriesKicker="Performans" label="Emtia Pulse" accent="live" />
        <div className="cdr-skeleton" style={{ height: 280, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-pulse-section cdr-pulse-section--inline" data-zone="pulse">
        <DetailSectionHead seriesKicker="Performans" label="Emtia Pulse" accent="live" />
        <p className="cdr-section-stub">Emtia pulse verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const pos = data.range24h.positionPct;
  const sourceLabel = data.source === "yahoo" ? "Yahoo Finance" : "Hesaplanmış";

  return (
    <section className="cdr-section cdr-pulse-section cdr-pulse-section--inline" data-zone="pulse" aria-label="Emtia pulse">
      <DetailSectionHead
        seriesKicker={sourceLabel}
        label="Emtia Pulse"
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
            <span>{fmtPrice(data.range24h.low, sym)}</span>
            <span className="cdr-pulse__range-mid">
              {fmtPrice(data.currentPrice, sym)} <em>{data.unit}</em>
            </span>
            <span>{fmtPrice(data.range24h.high, sym)}</span>
          </div>
        </div>

        <div className="cdr-pulse__facts">
          <div className="cdr-pulse__fact cdr-pulse__fact--vol">
            <span className="cdr-pulse__fact-k">Volatilite (24s)</span>
            <span className="cdr-pulse__fact-v">{data.volatility24hPct.toFixed(2)}%</span>
          </div>
          <div className="cdr-pulse__fact cdr-pulse__fact--pivot">
            <span className="cdr-pulse__fact-k">Pivot</span>
            <span className="cdr-pulse__fact-v">{fmtPrice(data.levels.pivot, sym)}</span>
          </div>
          <div className="cdr-pulse__fact cdr-pulse__fact--support">
            <span className="cdr-pulse__fact-k">Destek</span>
            <span className="cdr-pulse__fact-v cdr-up">{fmtPrice(data.levels.support, sym)}</span>
          </div>
          <div className="cdr-pulse__fact cdr-pulse__fact--resist">
            <span className="cdr-pulse__fact-k">Direnç</span>
            <span className="cdr-pulse__fact-v cdr-down">{fmtPrice(data.levels.resistance, sym)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
