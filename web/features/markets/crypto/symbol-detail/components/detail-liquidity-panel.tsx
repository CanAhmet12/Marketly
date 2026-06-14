"use client";

import { DetailDepthChart } from "@/features/markets/crypto/symbol-detail/components/detail-depth-chart";
import { DetailOrderBook } from "@/features/markets/crypto/symbol-detail/components/detail-order-book";
import { DetailTradesTape } from "@/features/markets/crypto/symbol-detail/components/detail-trades-tape";
import { useDetailSectionSurface } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-section-surface";
import { useDetailLiquidity } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-liquidity";
import { fmtPriceUsd } from "@/features/markets/crypto/symbol-detail/lib/format";

type Props = {
  symbol: string;
  minHeight?: number;
};

function fmtQty(qty: number): string {
  if (qty >= 1000) return qty.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (qty >= 1) return qty.toFixed(3);
  return qty.toFixed(6);
}

export function DetailLiquidityPanel({ symbol, minHeight = 580 }: Props) {
  const query = useDetailLiquidity(symbol);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <div className="cdr-liquidity cdr-liquidity--loading" style={{ minHeight }}>
        <div className="cdr-skeleton" style={{ height: minHeight, borderRadius: 12 }} />
      </div>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <div className="cdr-liquidity cdr-liquidity--error" style={{ minHeight }}>
        <p className="cdr-liquidity__error-title">Likidite verisi alınamadı</p>
        <p className="cdr-liquidity__error-desc">
          Bu sembol Binance Spot USDT paritesinde listelenmiyor olabilir.
        </p>
      </div>
    );
  }

  return (
    <div className="cdr-liquidity" style={{ minHeight }}>
      <div className="cdr-liquidity__stats" role="list">
        <div className="cdr-liquidity__stat" role="listitem">
          <span className="cdr-liquidity__stat-k">En iyi alış</span>
          <span className="cdr-liquidity__stat-v cdr-up">{fmtPriceUsd(data.bestBid)}</span>
        </div>
        <div className="cdr-liquidity__stat" role="listitem">
          <span className="cdr-liquidity__stat-k">En iyi satış</span>
          <span className="cdr-liquidity__stat-v cdr-down">{fmtPriceUsd(data.bestAsk)}</span>
        </div>
        <div className="cdr-liquidity__stat" role="listitem">
          <span className="cdr-liquidity__stat-k">Spread</span>
          <span className="cdr-liquidity__stat-v">
            {fmtPriceUsd(data.spread)}{" "}
            <em className="cdr-liquidity__stat-sub">({data.spreadBps.toFixed(1)} bps)</em>
          </span>
        </div>
        <div className="cdr-liquidity__stat" role="listitem">
          <span className="cdr-liquidity__stat-k">Orta fiyat</span>
          <span className="cdr-liquidity__stat-v">{fmtPriceUsd(data.midPrice)}</span>
        </div>
        <div className="cdr-liquidity__stat" role="listitem">
          <span className="cdr-liquidity__stat-k">Bid derinlik</span>
          <span className="cdr-liquidity__stat-v cdr-up">{fmtQty(data.bidDepthQty)}</span>
        </div>
        <div className="cdr-liquidity__stat" role="listitem">
          <span className="cdr-liquidity__stat-k">Ask derinlik</span>
          <span className="cdr-liquidity__stat-v cdr-down">{fmtQty(data.askDepthQty)}</span>
        </div>
      </div>

      <div className="cdr-liquidity__grid">
        <DetailOrderBook bids={data.bids} asks={data.asks} />
        <DetailDepthChart bids={data.bids} asks={data.asks} midPrice={data.midPrice} />
      </div>

      <DetailTradesTape trades={data.trades} />
    </div>
  );
}
