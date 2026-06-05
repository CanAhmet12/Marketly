"use client";

import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CommodityBottomStripPayload } from "@/features/markets/commodities/types";

type Props = { strip: CommodityBottomStripPayload };

const IMPACT_DOT: Record<string, string> = {
  high: "#ef4444", medium: "#f59e0b", low: "#64748b",
};

const CAL_ICONS: Record<string, string> = {
  opec: "🛢", report: "📋", harvest: "🌾", macro: "🏦",
};

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }

function fmtPrice(n: number, unit: string) {
  if (unit === "$/oz" && n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (unit === "$/bbl") return `$${n.toFixed(2)}`;
  if (unit === "c/bu") return `${n.toFixed(0)}¢`;
  return `$${n.toFixed(2)}`;
}

export function CommoditiesBottomStrip({ strip }: Props) {
  return (
    <div className="cc-bottom-strip cc-section" role="region" aria-label="Izleme, takvim ve korelasyon">

      {/* İzleme Listesi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>⭐</span>Izleme Listem</div>
          <Link href="/watchlist" className="cc-bottom-panel-link">Listeyi Gor →</Link>
        </div>
        <div className="cc-watchlist-scroll">
          {strip.watchlist.map((item) => (
            <div key={item.symbol} className="cc-watchlist-item">
              <span className="cc-watchlist-symbol" style={{ fontSize: 11 }}>{item.symbol}</span>
              <span className="cc-watchlist-price">{fmtPrice(item.price, item.unit)}</span>
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

      {/* Emtia Takvimi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>📅</span>Emtia Takvimi</div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">Takvim →</Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.calendar.map((item) => (
            <div key={item.id} className="cc-cal-row">
              <div className="cc-cal-icon" aria-hidden>{CAL_ICONS[item.type] ?? "📌"}</div>
              <div className="cc-cal-info">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316" }}>{item.date}</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: IMPACT_DOT[item.impact], flexShrink: 0 }} aria-hidden />
                </div>
                <span className="cc-cal-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DXY Korelasyon */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>📉</span>DXY Korelasyonu</div>
        </div>
        <div className="cm-correlation-grid">
          {strip.correlation.map((item) => {
            const absCorr = Math.abs(item.correlation);
            const isNeg = item.correlation < 0;
            const barColor = isNeg ? "#f97316" : "var(--cc-rose)";
            const fillPct = absCorr * 100;
            return (
              <div key={item.symbol} className="cm-corr-row">
                <span className="cm-corr-symbol">{item.symbol}</span>
                <div className="cm-corr-bar-wrap">
                  <div
                    className="cm-corr-bar-fill"
                    style={{
                      width: `${fillPct}%`,
                      background: barColor,
                      left: isNeg ? `${50 - fillPct / 2}%` : "50%",
                    }}
                  />
                </div>
                <span className="cm-corr-val" style={{ color: isNeg ? "#f97316" : "var(--cc-rose)" }}>
                  {item.correlation.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
