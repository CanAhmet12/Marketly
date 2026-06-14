"use client";

import type { LiquidityLevel } from "@/features/markets/crypto/lib/crypto-liquidity-types";
import { fmtPriceUsd } from "@/features/markets/crypto/symbol-detail/lib/format";

type Props = {
  bids: LiquidityLevel[];
  asks: LiquidityLevel[];
  midPrice: number;
};

export function DetailDepthChart({ bids, asks, midPrice }: Props) {
  const width = 400;
  const height = 220;
  const padX = 8;
  const padY = 12;

  if (bids.length === 0 || asks.length === 0 || midPrice <= 0) {
    return (
      <div className="cdr-depth-chart cdr-depth-chart--empty">
        <p>Depth grafiği için yeterli veri yok.</p>
      </div>
    );
  }

  const priceMin = bids[bids.length - 1]?.price ?? midPrice;
  const priceMax = asks[asks.length - 1]?.price ?? midPrice;
  const priceSpan = priceMax - priceMin || 1;

  const maxCum = Math.max(
    bids[bids.length - 1]?.cumQty ?? 0,
    asks[asks.length - 1]?.cumQty ?? 0,
    1,
  );

  const xForPrice = (price: number) =>
    padX + ((price - priceMin) / priceSpan) * (width - padX * 2);

  const yForCum = (cum: number) =>
    height - padY - (cum / maxCum) * (height - padY * 2);

  const midX = xForPrice(midPrice);

  const bidPoints = bids.map((b) => `${xForPrice(b.price)},${yForCum(b.cumQty)}`);
  const bidPath = `M ${midX},${height - padY} L ${bidPoints.join(" L ")} L ${xForPrice(bids[bids.length - 1]!.price)},${height - padY} Z`;

  const askPoints = asks.map((a) => `${xForPrice(a.price)},${yForCum(a.cumQty)}`);
  const askPath = `M ${midX},${height - padY} L ${askPoints.join(" L ")} L ${xForPrice(asks[asks.length - 1]!.price)},${height - padY} Z`;

  return (
    <div className="cdr-depth-chart">
      <div className="cdr-depth-chart__head">
        <span className="cdr-depth-chart__title">Depth</span>
        <span className="cdr-depth-chart__mid">{fmtPriceUsd(midPrice)}</span>
      </div>
      <svg
        className="cdr-depth-chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Emir defteri depth grafiği"
      >
        <line
          x1={midX}
          y1={padY}
          x2={midX}
          y2={height - padY}
          className="cdr-depth-chart__midline"
        />
        <path d={bidPath} className="cdr-depth-chart__fill cdr-depth-chart__fill--bid" />
        <path d={askPath} className="cdr-depth-chart__fill cdr-depth-chart__fill--ask" />
      </svg>
      <div className="cdr-depth-chart__legend">
        <span className="cdr-depth-chart__legend-item cdr-up">Alış derinliği</span>
        <span className="cdr-depth-chart__legend-item cdr-down">Satış derinliği</span>
      </div>
    </div>
  );
}
