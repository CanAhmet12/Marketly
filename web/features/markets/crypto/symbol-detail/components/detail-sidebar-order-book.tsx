"use client";

import { memo, useMemo, type CSSProperties } from "react";

import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { useOrderBookPrefs } from "@/features/markets/crypto/symbol-detail/hooks/use-order-book-prefs";
import { useOrderBookStream } from "@/features/markets/crypto/symbol-detail/hooks/use-order-book-stream";
import {
  fmtBookPrice,
  ORDERBOOK_DECIMAL_OPTIONS,
  type OrderBookDecimalPreset,
} from "@/features/markets/crypto/symbol-detail/lib/order-book-format";
import type { OrderBookLevel } from "@/features/markets/crypto/symbol-detail/lib/order-book-types";
import { ORDER_BOOK_LEVELS } from "@/features/markets/crypto/symbol-detail/lib/order-book-types";
import { fmtCompactQty } from "@/features/markets/crypto/symbol-detail/lib/format";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function fmtBookQty(qty: number): string {
  if (qty >= 1000) return fmtCompactQty(qty);
  if (qty >= 1) return qty.toFixed(2);
  return qty.toFixed(4);
}

function DecimalToolbar({
  decimals,
  onDecimals,
}: {
  decimals: OrderBookDecimalPreset;
  onDecimals: (preset: OrderBookDecimalPreset) => void;
}) {
  return (
    <div className="cdr-orderbook__toolbar" role="group" aria-label="Fiyat hassasiyeti">
      {ORDERBOOK_DECIMAL_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={cn("cdr-orderbook__chip-btn", decimals === opt.id && "cdr-orderbook__chip-btn--on")}
          onClick={() => onDecimals(opt.id)}
          aria-pressed={decimals === opt.id}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SplitSide({
  level,
  side,
  top,
  decimals,
}: {
  level: OrderBookLevel | undefined;
  side: "bid" | "ask";
  top?: boolean;
  decimals: OrderBookDecimalPreset;
}) {
  if (!level) {
    return (
      <div className={cn("cdr-orderbook__split-side", `cdr-orderbook__split-side--${side}`)}>
        <span className="cdr-orderbook__empty">—</span>
      </div>
    );
  }

  const depthPct = Math.max(level.depthPct, 6);

  if (side === "bid") {
    return (
      <div
        className={cn(
          "cdr-orderbook__split-side cdr-orderbook__split-side--bid",
          top && "cdr-orderbook__split-side--top",
        )}
      >
        <span
          className="cdr-orderbook__split-depth cdr-orderbook__split-depth--bid"
          style={{ width: `${depthPct}%` }}
          aria-hidden
        />
        <span className="cdr-orderbook__split-qty">{fmtBookQty(level.qty)}</span>
        <span className="cdr-orderbook__split-price cdr-orderbook__split-price--bid">
          {fmtBookPrice(level.price, decimals)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "cdr-orderbook__split-side cdr-orderbook__split-side--ask",
        top && "cdr-orderbook__split-side--top",
      )}
    >
      <span
        className="cdr-orderbook__split-depth cdr-orderbook__split-depth--ask"
        style={{ width: `${depthPct}%` }}
        aria-hidden
      />
      <span className="cdr-orderbook__split-price cdr-orderbook__split-price--ask">
        {fmtBookPrice(level.price, decimals)}
      </span>
      <span className="cdr-orderbook__split-qty">{fmtBookQty(level.qty)}</span>
    </div>
  );
}

function OrderBookSkeleton() {
  return (
    <div className="cdr-orderbook__skeleton" aria-hidden>
      <div className="cdr-orderbook__skeleton-meta">
        <span />
        <span />
      </div>
      <div className="cdr-orderbook__skeleton-toolbar" />
      <div className="cdr-orderbook__skeleton-pressure" />
      <div className="cdr-orderbook__skeleton-rows">
        {Array.from({ length: ORDER_BOOK_LEVELS }, (_, i) => (
          <span key={i} className="cdr-orderbook__skeleton-row" />
        ))}
      </div>
    </div>
  );
}

function OrderBookInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase();
  const { snapshot, status, pair } = useOrderBookStream(sym);
  const { decimals, setDecimals } = useOrderBookPrefs();
  const isLive = status === "live" && snapshot.connected;
  const isConnecting = status === "connecting";
  const sourceLabel = snapshot.source === "bybit" ? "Bybit Spot" : "Binance Spot";

  const bids = useMemo(() => snapshot.bids.slice(0, ORDER_BOOK_LEVELS), [snapshot.bids]);
  const asks = useMemo(() => snapshot.asks.slice(-ORDER_BOOK_LEVELS), [snapshot.asks]);

  const pressure = useMemo(() => {
    const bidTotal = snapshot.bids.reduce((sum, row) => sum + row.qty, 0);
    const askTotal = snapshot.asks.reduce((sum, row) => sum + row.qty, 0);
    const total = bidTotal + askTotal;
    if (total <= 0) return { bidPct: 50, askPct: 50 };
    return {
      bidPct: (bidTotal / total) * 100,
      askPct: (askTotal / total) * 100,
    };
  }, [snapshot.asks, snapshot.bids]);

  const bestAsk = asks[asks.length - 1];
  const bestBid = bids[0];

  const splitRows = useMemo(
    () =>
      Array.from({ length: ORDER_BOOK_LEVELS }, (_, i) => ({
        bid: bids[i],
        ask: asks[i],
      })),
    [asks, bids],
  );

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--orderbook"
      data-zone="orderbook"
      aria-label="Alım satım tahtası"
    >
      <DetailSectionHead
        seriesKicker={isLive ? sourceLabel : "Derinlik"}
        label="Alım Satım Tahtası"
        accent="teal"
        trailing={
          <span
            className={cn(
              "cdr-live-pill",
              isLive && "cdr-live-pill--on",
              isConnecting && "cdr-live-pill--wait",
              !isLive && !isConnecting && "cdr-live-pill--off",
            )}
          >
            <span
              className={cn("cdr-live-pill__dot", isLive && "cdr-live-pill__dot--pulse")}
              aria-hidden
            />
            <span className="cdr-live-pill__text">
              {isLive ? "Canlı" : isConnecting ? "Bağlanıyor" : "Kapalı"}
            </span>
          </span>
        }
      />

      {status === "unavailable" && snapshot.bids.length === 0 ? (
        <p className="cdr-section-stub">Tahta verisi şu an kullanılamıyor.</p>
      ) : isConnecting && snapshot.bids.length === 0 ? (
        <OrderBookSkeleton />
      ) : (
        <>
          <div className="cdr-orderbook__meta">
            <div className="cdr-orderbook__meta-item cdr-orderbook__meta-item--spread">
              <span className="cdr-orderbook__meta-k">Spread</span>
              <span className="cdr-orderbook__meta-v">
                {snapshot.spread > 0 ? fmtBookPrice(snapshot.spread, decimals) : "—"}
                {snapshot.spreadPct > 0 ? (
                  <em>{snapshot.spreadPct.toFixed(3)}%</em>
                ) : null}
              </span>
            </div>
            <div className="cdr-orderbook__meta-item cdr-orderbook__meta-item--mid">
              <span className="cdr-orderbook__meta-k">Orta fiyat</span>
              <span className="cdr-orderbook__meta-v">
                {snapshot.mid > 0 ? fmtBookPrice(snapshot.mid, decimals) : "—"}
              </span>
            </div>
          </div>

          <DecimalToolbar decimals={decimals} onDecimals={setDecimals} />

          <div className="cdr-orderbook__pressure" aria-label="Alış satış derinlik dengesi">
            <div className="cdr-orderbook__pressure-labels">
              <span className="cdr-orderbook__pressure-side cdr-orderbook__pressure-side--bid">
                Alış {pressure.bidPct.toFixed(0)}%
              </span>
              <span className="cdr-orderbook__pressure-side cdr-orderbook__pressure-side--ask">
                Satış {pressure.askPct.toFixed(0)}%
              </span>
            </div>
            <div className="cdr-orderbook__pressure-track">
              <span
                className="cdr-orderbook__pressure-fill cdr-orderbook__pressure-fill--bid"
                style={{ width: `${pressure.bidPct}%` }}
              />
              <span
                className="cdr-orderbook__pressure-fill cdr-orderbook__pressure-fill--ask"
                style={{ width: `${pressure.askPct}%` }}
              />
            </div>
          </div>

          <div
            className="cdr-orderbook__board cdr-orderbook__board--split"
            style={{ "--cdr-orderbook-rows": ORDER_BOOK_LEVELS } as CSSProperties}
          >
            <div className="cdr-orderbook__split-head" aria-hidden>
              <span>Alış</span>
              <span>Satış</span>
            </div>
            <div className="cdr-orderbook__split-cols" aria-hidden>
              <span>Miktar</span>
              <span>Fiyat</span>
              <span>Fiyat</span>
              <span>Miktar</span>
            </div>

            <div className="cdr-orderbook__split-rows" aria-label="Alım satım emirleri">
              {splitRows.map((row, index) => (
                <div key={`split-${index}`} className="cdr-orderbook__split-row">
                  <SplitSide
                    level={row.bid}
                    side="bid"
                    top={bestBid?.price === row.bid?.price}
                    decimals={decimals}
                  />
                  <span className="cdr-orderbook__split-divider" aria-hidden />
                  <SplitSide
                    level={row.ask}
                    side="ask"
                    top={bestAsk?.price === row.ask?.price}
                    decimals={decimals}
                  />
                </div>
              ))}
            </div>

            <div className="cdr-orderbook__split-mid">
              <span className="cdr-orderbook__mid-pair">{pair}</span>
              <span className="cdr-orderbook__mid-spread">
                {snapshot.bestBid > 0 && snapshot.bestAsk > 0
                  ? `${fmtBookPrice(snapshot.bestBid, decimals)} · ${fmtBookPrice(snapshot.bestAsk, decimals)}`
                  : "—"}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export const DetailSidebarOrderBook = memo(OrderBookInner);
