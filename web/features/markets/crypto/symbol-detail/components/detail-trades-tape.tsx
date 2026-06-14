"use client";

import type { LiquidityTrade } from "@/features/markets/crypto/lib/crypto-liquidity-types";
import { fmtPriceUsd } from "@/features/markets/crypto/symbol-detail/lib/format";
import { cn } from "@/lib/cn";

type Props = {
  trades: LiquidityTrade[];
};

function fmtQty(qty: number): string {
  if (qty >= 1000) return qty.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (qty >= 1) return qty.toFixed(4);
  return qty.toFixed(6);
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function DetailTradesTape({ trades }: Props) {
  return (
    <div className="cdr-trades-tape">
      <div className="cdr-trades-tape__head">
        <span className="cdr-trades-tape__title">Son İşlemler</span>
        <span className="cdr-trades-tape__live">
          <span className="cdr-trades-tape__dot" aria-hidden />
          Canlı
        </span>
      </div>

      <div className="cdr-trades-tape__cols" aria-hidden>
        <span>Saat</span>
        <span>Fiyat</span>
        <span>Miktar</span>
        <span>Yön</span>
      </div>

      <ul className="cdr-trades-tape__list">
        {trades.length === 0 ? (
          <li className="cdr-trades-tape__empty">Henüz işlem yok.</li>
        ) : (
          trades.map((t) => (
            <li key={t.id} className={cn("cdr-trades-tape__row", t.side === "buy" ? "cdr-up" : "cdr-down")}>
              <span className="cdr-trades-tape__time">{fmtTime(t.time)}</span>
              <span className="cdr-trades-tape__price">{fmtPriceUsd(t.price)}</span>
              <span className="cdr-trades-tape__qty">{fmtQty(t.qty)}</span>
              <span className="cdr-trades-tape__side">{t.side === "buy" ? "Alış" : "Satış"}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
