"use client";

import Link from "next/link";

import { MarketNewsWireRow } from "@/features/markets/components/market-news/market-news-wire-row";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  PanelIconCalendar,
  PanelIconNews,
  PanelIconWatchlist,
} from "@/features/markets/crypto/components/crypto-editorial-icons";
import { formatCommodityTickerPrice } from "@/features/markets/commodities/lib/map-commodity-tickers";
import type { CommodityBottomStripPayload } from "@/features/markets/commodities/types";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  strip: CommodityBottomStripPayload;
  newsIntel?: readonly MarketNewsIntelligenceItem[];
};

const IMPACT_CLASS: Record<string, string> = {
  high: "cm-cal-impact--high",
  medium: "cm-cal-impact--medium",
  low: "cm-cal-impact--low",
};

const CAL_ICONS: Record<string, string> = {
  opec: "🛢",
  report: "📋",
  harvest: "🌾",
  macro: "🏦",
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtPrice(n: number, unit: string, symbol: string) {
  if (!n) return "—";
  if (unit === "c/bu") return `${n.toFixed(0)}¢`;
  return formatCommodityTickerPrice(n, symbol);
}

export function CommoditiesBottomStrip({ strip, newsIntel }: Props) {
  const hasIntelNews = newsIntel && newsIntel.length > 0;

  return (
    <div className="cc-bottom-strip cc-section cm-bottom-strip" role="region" aria-label="İzleme, haberler ve emtia takvimi">
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <PanelIconWatchlist className="cc-panel-icon" />
            İzleme Listem
          </div>
          <Link href="/watchlist" className="cc-bottom-panel-link">
            Listeyi Gör →
          </Link>
        </div>
        <div className="cc-watchlist-scroll">
          {strip.watchlist.length === 0 ? (
            <p className="cm-bottom-empty">Emtia ekleyin</p>
          ) : (
            strip.watchlist.map((item) => (
              <Link
                key={item.symbol}
                href={`/markets/${encodeURIComponent(item.symbol)}`}
                className="cc-watchlist-item"
                aria-label={`${item.symbol} detayı`}
              >
                <span className="cm-watchlist-symbol-badge">{item.symbol.slice(0, 2)}</span>
                <span className="cc-watchlist-symbol">{item.symbol}</span>
                <span className="cc-watchlist-price">{fmtPrice(item.price, item.unit, item.symbol)}</span>
                <span className={cn("cc-watchlist-change", item.changePct >= 0 ? "cc-up" : "cc-down")}>
                  {signed(item.changePct)}
                </span>
                <div className="cc-watchlist-spark">
                  <MiniSparkline series={item.sparkline} trend={item.trend} height={24} className="w-full" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <PanelIconNews className="cc-panel-icon" />
            Emtia &amp; Makro Haberleri
          </div>
          <Link href="/market-news" className="cc-bottom-panel-link">
            Tüm Haberler →
          </Link>
        </div>
        {hasIntelNews ? (
          <div className="cc-news-intel-rows">
            {newsIntel!.slice(0, 4).map((item, i) => (
              <MarketNewsWireRow key={item.id} item={item} rank={i + 1} compact />
            ))}
          </div>
        ) : (
          <p className="cm-bottom-empty">Canlı haber akışı yükleniyor</p>
        )}
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <PanelIconCalendar className="cc-panel-icon" />
            Emtia Takvimi
          </div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">
            Tüm Takvim →
          </Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.calendar.length === 0 ? (
            <p className="cm-bottom-empty">Yakın etkinlik yok</p>
          ) : (
            strip.calendar.map((item) => (
              <div key={item.id} className="cc-cal-row cm-cal-row">
                <div className="cc-cal-icon cm-cal-icon" aria-hidden>
                  {CAL_ICONS[item.type] ?? "📌"}
                </div>
                <div className="cc-cal-info">
                  <div className="cm-cal-meta">
                    <span className="cm-cal-date">{item.date}</span>
                    <span className={cn("cm-cal-impact-dot", IMPACT_CLASS[item.impact])} aria-hidden />
                  </div>
                  <span className="cc-cal-title">{item.title}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="cc-bottom-panel cm-bottom-panel--corr">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">DXY Korelasyonu</div>
        </div>
        <div className="cm-correlation-grid">
          {strip.correlation.length === 0 ? (
            <p className="cm-bottom-empty">Korelasyon verisi yok</p>
          ) : (
            strip.correlation.map((item) => {
              const absCorr = Math.abs(item.correlation);
              const isNeg = item.correlation < 0;
              const barColor = isNeg ? "var(--cc-gold)" : "var(--cc-rose)";
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
                  <span className="cm-corr-val" style={{ color: isNeg ? "var(--cc-gold)" : "var(--cc-rose)" }}>
                    {item.correlation.toFixed(2)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
