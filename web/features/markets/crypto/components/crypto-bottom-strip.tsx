"use client";

import Link from "next/link";

import { marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CryptoBottomStripPayload } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = { strip: CryptoBottomStripPayload };

const CAL_ICONS: Record<string, string> = {
  unlock:  "🔓",
  etf:     "📊",
  macro:   "🏦",
  fork:    "⚡",
  listing: "📋",
};

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function CryptoBottomStrip({ strip }: Props) {
  return (
    <div className="cc-bottom-strip cc-section" role="region" aria-label="İzleme, haberler ve etkinlikler">

      {/* İzleme Listesi */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <span aria-hidden>⭐</span>
            İzleme Listem
          </div>
          <Link href="/watchlist" className="cc-bottom-panel-link">
            Listeyi Gör →
          </Link>
        </div>
        <div className="cc-watchlist-scroll">
          {strip.watchlist.map((item) => (
            <Link
              key={item.symbol}
              href={`/markets/${encodeURIComponent(item.symbol)}`}
              className="cc-watchlist-item"
              aria-label={`${item.symbol} detayı`}
            >
              <span className="cc-watchlist-symbol">{item.symbol}</span>
              <span className="cc-watchlist-price">{fmtPrice(item.price)}</span>
              <span
                className="cc-watchlist-change"
                style={{ color: item.change24h >= 0 ? "var(--cc-teal)" : "var(--cc-rose)" }}
              >
                {signed(item.change24h)}
              </span>
              <div className="cc-watchlist-spark">
                <MiniSparkline series={item.sparkline} trend={item.trend} height={24} className="w-full" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Kripto Haberleri */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <span aria-hidden>📰</span>
            Kripto Haberleri
          </div>
          <Link href="/market-news" className="cc-bottom-panel-link">
            Tüm Haberler →
          </Link>
        </div>
        <div className="cc-news-rows">
          {strip.news.map((item) => (
            <Link
              key={item.id}
              href={marketNewsDetailHref(item.id)}
              className="cc-news-row"
              aria-label={item.title}
            >
              <div className="cc-news-row-meta">
                <span className="cc-news-tag">{item.tag}</span>
                <span className="cc-news-time">{item.timeAgo}</span>
              </div>
              <span className="cc-news-title">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Yaklaşan Etkinlikler */}
      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <span aria-hidden>📅</span>
            Yaklaşan Etkinlikler
          </div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">
            Tüm Takvim →
          </Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.calendar.map((item) => (
            <div key={item.id} className="cc-cal-row">
              <div className="cc-cal-icon" aria-hidden>
                {CAL_ICONS[item.type] ?? "📌"}
              </div>
              <div className="cc-cal-info">
                <span className="cc-cal-title">{item.title}</span>
                <span className="cc-cal-date">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
