"use client";

import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { NasdaqBottomStripPayload } from "@/features/markets/nasdaq/types";

type Props = { strip: NasdaqBottomStripPayload };

const IMPACT_DOT: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#64748b" };

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }

export function NasdaqBottomStrip({ strip }: Props) {
  return (
    <div className="cc-bottom-strip cc-section" role="region" aria-label="Izleme, kazanc ve Fed takvimi">

      {/* İzleme Listesi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>⭐</span>Izleme Listem</div>
          <Link href="/watchlist" className="cc-bottom-panel-link">Listeyi Gor →</Link>
        </div>
        <div className="cc-watchlist-scroll">
          {strip.watchlist.map((item) => (
            <Link key={item.symbol} href={`/markets/${encodeURIComponent(item.symbol)}`} className="cc-watchlist-item" aria-label={item.symbol}>
              <span className="cc-watchlist-symbol">{item.symbol}</span>
              <span className="cc-watchlist-price">${item.price >= 1000 ? item.price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : item.price.toFixed(2)}</span>
              <span className="cc-watchlist-change" style={{ color: item.changePct >= 0 ? "var(--cc-teal)" : "var(--cc-rose)" }}>
                {signed(item.changePct)}
              </span>
              <div className="cc-watchlist-spark">
                <MiniSparkline series={item.sparkline} trend={item.trend} height={24} className="w-full" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Kazanç Takvimi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>📊</span>Kazanc Takvimi</div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">Tum Kazanclar →</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {strip.earnings.map((item) => (
            <div key={item.id} className="nq-earnings-row">
              <span className="nq-earnings-ticker">{item.ticker}</span>
              <div className="nq-earnings-info">
                <span className="nq-earnings-name">{item.name}</span>
                <span className="nq-earnings-date">
                  {item.date} · {item.timing === "AMC" ? "Kapanıs Sonrasi" : "Acilis Oncesi"}
                </span>
              </div>
              <span className="nq-earnings-est">{item.epsEst}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Makro & Fed Takvimi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title"><span aria-hidden>🏦</span>Makro & Fed</div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">Takvim →</Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.macroFed.map((item) => (
            <div key={item.id} className="cc-cal-row">
              <div className="cc-cal-icon" aria-hidden>🇺🇸</div>
              <div className="cc-cal-info">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4" }}>{item.date}</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: IMPACT_DOT[item.impact], flexShrink: 0 }} aria-hidden />
                </div>
                <span className="cc-cal-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
