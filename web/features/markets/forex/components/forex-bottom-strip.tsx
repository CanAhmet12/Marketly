"use client";

import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { ForexBottomStripPayload } from "@/features/markets/forex/types";

type Props = { strip: ForexBottomStripPayload };

const IMPACT_DOT: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#64748b",
};

const COUNTRY_FLAG: Record<string, string> = {
  US: "🇺🇸", EU: "🇪🇺", TR: "🇹🇷", GB: "🇬🇧",
  JP: "🇯🇵", CH: "🇨🇭", AU: "🇦🇺", CA: "🇨🇦",
};

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }

function fmtRate(n: number, pair: string) {
  if (pair.includes("JPY") || pair.includes("TRY")) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function fmtPrice(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(2);
}

export function ForexBottomStrip({ strip }: Props) {
  return (
    <div className="cc-bottom-strip cc-section" role="region" aria-label="Izleme, merkez bankasi ve emtia">

      {/* İzleme Listesi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>⭐</span>Izleme Listem</div>
          <Link href="/watchlist" className="cc-bottom-panel-link">Listeyi Gor →</Link>
        </div>
        <div className="cc-watchlist-scroll">
          {strip.watchlist.map((item) => (
            <div key={item.pair} className="cc-watchlist-item">
              <span className="cc-watchlist-symbol" style={{ fontSize: 11 }}>{item.pair}</span>
              <span className="cc-watchlist-price">{fmtRate(item.rate, item.pair)}</span>
              <span className="cc-watchlist-change" style={{ color: item.changePct >= 0 ? "var(--cc-teal)" : "var(--cc-rose)" }}>
                {signed(item.changePct)}
              </span>
              <div className="cc-watchlist-spark">
                <MiniSparkline series={item.sparkline} trend={item.trend} height={24} className="w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MB Takvimi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>🏦</span>Merkez Bankasi Takvimi</div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">Takvim →</Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.centralBanks.map((item) => (
            <div key={item.id} className="cc-cal-row">
              <div className="cc-cal-icon" aria-hidden>{COUNTRY_FLAG[item.country] ?? "🌐"}</div>
              <div className="cc-cal-info">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--cc-meta)" }}>{item.time}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6" }}>{item.bank}</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: IMPACT_DOT[item.impact], flexShrink: 0 }} aria-hidden />
                </div>
                <span className="cc-cal-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emtia Korelasyonu */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>📊</span>Emtia Korelasyonu</div>
        </div>
        <div className="fc-commodity-grid">
          {strip.commodities.map((item) => (
            <div key={item.symbol} className="fc-commodity-row">
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span className="fc-commodity-symbol">{item.symbol}</span>
                {item.unit && <span style={{ fontSize: 9, color: "var(--cc-meta)" }}>{item.unit}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                <span className="fc-commodity-price">{fmtPrice(item.price)}</span>
                <span className="fc-commodity-change" style={{ color: item.changePct >= 0 ? "var(--cc-teal)" : "var(--cc-rose)" }}>
                  {signed(item.changePct)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
