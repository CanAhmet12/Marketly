"use client";

import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { BistBottomStripPayload } from "@/features/markets/bist/types";

type Props = { strip: BistBottomStripPayload };

const IMPACT_DOT: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#64748b",
};

const COUNTRY_FLAG: Record<string, string> = {
  TR: "🇹🇷",
  US: "🇺🇸",
  EU: "🇪🇺",
};

function fmtTL(n: number) {
  if (n >= 1000) return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function BistBottomStrip({ strip }: Props) {
  return (
    <div className="cc-bottom-strip cc-section" role="region" aria-label="Izleme, gundem ve doviz">

      {/* İzleme Listesi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <span aria-hidden>⭐</span>
            Izleme Listem
          </div>
          <Link href="/watchlist" className="cc-bottom-panel-link">Listeyi Gor →</Link>
        </div>
        <div className="cc-watchlist-scroll">
          {strip.watchlist.map((item) => (
            <Link
              key={item.symbol}
              href={`/markets/${encodeURIComponent(item.symbol)}`}
              className="cc-watchlist-item"
              aria-label={`${item.symbol} detayi`}
            >
              <span className="cc-watchlist-symbol">{item.symbol}</span>
              <span className="cc-watchlist-price">{fmtTL(item.price)} TL</span>
              <span
                className="cc-watchlist-change"
                style={{ color: item.changePercent >= 0 ? "var(--cc-teal)" : "var(--cc-rose)" }}
              >
                {signed(item.changePercent)}
              </span>
              <div className="cc-watchlist-spark">
                <MiniSparkline series={item.sparkline} trend={item.trend} height={24} className="w-full" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Piyasa Gündemi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <span aria-hidden>📋</span>
            Piyasa Gundemi
          </div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">Takvim →</Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.gundem.map((item) => (
            <div key={item.id} className="cc-cal-row">
              <div className="cc-cal-icon" aria-hidden>
                {COUNTRY_FLAG[item.country] ?? "🌐"}
              </div>
              <div className="cc-cal-info">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--cc-meta)" }}>{item.time}</span>
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: IMPACT_DOT[item.impact],
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                </div>
                <span className="cc-cal-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Döviz & Emtia */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <span aria-hidden>💱</span>
            Doviz & Emtia
          </div>
        </div>
        <div className="bc-fx-grid">
          {strip.fx.map((item) => (
            <div key={item.symbol} className="bc-fx-row">
              <span className="bc-fx-symbol">{item.symbol}</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                <span className="bc-fx-price">{fmtTL(item.price)}</span>
                <span
                  className="bc-fx-change"
                  style={{ color: item.changePercent >= 0 ? "var(--cc-teal)" : "var(--cc-rose)" }}
                >
                  {signed(item.changePercent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
