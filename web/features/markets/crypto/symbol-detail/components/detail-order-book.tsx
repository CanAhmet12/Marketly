"use client";

import { useMemo } from "react";

import type { LiquidityLevel } from "@/features/markets/crypto/lib/crypto-liquidity-types";
import { fmtPriceUsd } from "@/features/markets/crypto/symbol-detail/lib/format";

type Props = {
  bids: LiquidityLevel[];
  asks: LiquidityLevel[];
  rows?: number;
};

function fmtQty(qty: number): string {
  if (qty >= 1000) return qty.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (qty >= 1) return qty.toFixed(4);
  return qty.toFixed(6);
}

export function DetailOrderBook({ bids, asks, rows = 16 }: Props) {
  const { bidRows, askRows, maxQty } = useMemo(() => {
    const bidSlice = bids.slice(0, rows);
    const askSlice = asks.slice(0, rows);
    const max = Math.max(
      ...bidSlice.map((b) => b.qty),
      ...askSlice.map((a) => a.qty),
      0.000_001,
    );
    return { bidRows: bidSlice, askRows: askSlice, maxQty: max };
  }, [asks, bids, rows]);

  return (
    <div className="cdr-order-book">
      <div className="cdr-order-book__head">
        <span>Emir Defteri</span>
        <span className="cdr-order-book__src">Binance Spot</span>
      </div>

      <div className="cdr-order-book__cols" aria-hidden>
        <span>Alış tarafı</span>
        <span>Satış tarafı</span>
      </div>

      <div className="cdr-order-book__rows">
        {Array.from({ length: rows }, (_, i) => {
          const bid = bidRows[i];
          const ask = askRows[i];
          const bidPct = bid ? (bid.qty / maxQty) * 100 : 0;
          const askPct = ask ? (ask.qty / maxQty) * 100 : 0;

          return (
            <div key={i} className="cdr-order-book__row">
              <div className="cdr-order-book__side cdr-order-book__side--bid">
                {bid ? (
                  <>
                    <span
                      className="cdr-order-book__bar cdr-order-book__bar--bid"
                      style={{ width: `${bidPct}%` }}
                      aria-hidden
                    />
                    <span className="cdr-order-book__qty">{fmtQty(bid.qty)}</span>
                    <span className="cdr-order-book__price cdr-up">{fmtPriceUsd(bid.price)}</span>
                  </>
                ) : (
                  <span className="cdr-order-book__empty">—</span>
                )}
              </div>

              <div className="cdr-order-book__side cdr-order-book__side--ask">
                {ask ? (
                  <>
                    <span className="cdr-order-book__price cdr-down">{fmtPriceUsd(ask.price)}</span>
                    <span className="cdr-order-book__qty">{fmtQty(ask.qty)}</span>
                    <span
                      className="cdr-order-book__bar cdr-order-book__bar--ask"
                      style={{ width: `${askPct}%` }}
                      aria-hidden
                    />
                  </>
                ) : (
                  <span className="cdr-order-book__empty">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
