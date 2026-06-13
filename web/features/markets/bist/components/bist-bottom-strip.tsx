"use client";

import Link from "next/link";

import { MarketNewsWireRow } from "@/features/markets/components/market-news/market-news-wire-row";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  PanelIconCalendar,
  PanelIconNews,
  PanelIconWatchlist,
} from "@/features/markets/crypto/components/crypto-editorial-icons";
import type { BistBottomStripPayload } from "@/features/markets/bist/types";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  strip: BistBottomStripPayload;
  newsIntel?: readonly MarketNewsIntelligenceItem[];
};

const IMPACT_CLASS: Record<string, string> = {
  high: "bc-cal-impact--high",
  medium: "bc-cal-impact--medium",
  low: "bc-cal-impact--low",
};

const COUNTRY_FLAG: Record<string, string> = {
  TR: "🇹🇷",
  US: "🇺🇸",
  EU: "🇪🇺",
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtTL(n: number) {
  if (n >= 1000) return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function BistBottomStrip({ strip, newsIntel }: Props) {
  const hasIntelNews = newsIntel && newsIntel.length > 0;

  return (
    <div className="cc-bottom-strip cc-section bc-bottom-strip" role="region" aria-label="İzleme, gündem ve döviz">
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
            <p className="bc-bottom-empty">Hisse ekleyin</p>
          ) : (
            strip.watchlist.map((item) => (
              <Link
                key={item.symbol}
                href={`/markets/${encodeURIComponent(item.symbol)}`}
                className="cc-watchlist-item"
                aria-label={`${item.symbol} detayı`}
              >
                <span className="bc-watchlist-symbol-badge">{item.symbol.slice(0, 2)}</span>
                <span className="cc-watchlist-symbol">{item.symbol}</span>
                <span className="cc-watchlist-price">{fmtTL(item.price)} TL</span>
                <span className={cn("cc-watchlist-change", item.changePercent >= 0 ? "cc-up" : "cc-down")}>
                  {signed(item.changePercent)}
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
            BIST &amp; Makro Haberleri
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
          <p className="bc-bottom-empty">Canlı haber akışı yükleniyor</p>
        )}
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <PanelIconCalendar className="cc-panel-icon" />
            Piyasa Gündemi
          </div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">
            Tüm Takvim →
          </Link>
        </div>
        <div className="bc-gundem-list">
          {strip.gundem.length === 0 ? (
            <p className="bc-bottom-empty">Yakın etkinlik yok</p>
          ) : (
            strip.gundem.map((item) => (
              <div key={item.id} className="cc-cal-row bc-cal-row">
                <div className="cc-cal-icon bc-cal-icon" aria-hidden>
                  {COUNTRY_FLAG[item.country] ?? "🌐"}
                </div>
                <div className="cc-cal-info">
                  <div className="bc-cal-meta">
                    <span className="bc-cal-time">{item.time}</span>
                    <span className={cn("bc-cal-impact-dot", IMPACT_CLASS[item.impact])} aria-hidden />
                  </div>
                  <span className="cc-cal-title">{item.title}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">Döviz &amp; Emtia</div>
        </div>
        <div className="bc-fx-grid">
          {strip.fx.length === 0 ? (
            <p className="bc-bottom-empty">Kur verisi yok</p>
          ) : (
            strip.fx.map((item) => (
              <Link
                key={item.symbol}
                href={`/markets/${encodeURIComponent(item.symbol.replace("/", ""))}`}
                className="bc-fx-row bc-fx-row--link"
              >
                <span className="bc-fx-symbol">{item.symbol}</span>
                <div className="bc-fx-copy">
                  <span className="bc-fx-price">{fmtTL(item.price)}</span>
                  <span className={cn("bc-fx-change", item.changePercent >= 0 ? "cc-up" : "cc-down")}>
                    {signed(item.changePercent)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
