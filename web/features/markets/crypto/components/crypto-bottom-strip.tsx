"use client";

import Link from "next/link";

import { MarketNewsWireRow } from "@/features/markets/components/market-news/market-news-wire-row";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import {
  CalendarTypeBadge,
  PanelIconCalendar,
  PanelIconNews,
  PanelIconWatchlist,
} from "@/features/markets/crypto/components/crypto-editorial-icons";
import type { CryptoBottomStripPayload } from "@/features/markets/crypto/types";
import { economicCalendarEventHref } from "@/features/markets/lib/economic-calendar-shared";
import { marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  strip: CryptoBottomStripPayload;
  newsIntel?: readonly MarketNewsIntelligenceItem[];
};

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function CryptoBottomStrip({ strip, newsIntel }: Props) {
  const hasIntelNews = newsIntel && newsIntel.length > 0;

  return (
    <div className="cc-bottom-strip cc-section" role="region" aria-label="İzleme, haberler ve etkinlikler">
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
          {strip.watchlist.map((item) => (
            <Link
              key={item.symbol}
              href={`/markets/${encodeURIComponent(item.symbol)}`}
              className="cc-watchlist-item"
              aria-label={`${item.symbol} detayı`}
            >
              <MarketSymbolIcon symbol={item.symbol} size={22} className="cc-watchlist-icon" />
              <span className="cc-watchlist-symbol">{item.symbol}</span>
              <span className="cc-watchlist-price">{fmtPrice(item.price)}</span>
              <span className={cn("cc-watchlist-change", item.change24h >= 0 ? "cc-up" : "cc-down")}>
                {signed(item.change24h)}
              </span>
              <div className="cc-watchlist-spark">
                <MiniSparkline series={item.sparkline} trend={item.trend} height={24} className="w-full" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <PanelIconNews className="cc-panel-icon" />
            Kripto Haberleri
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
        )}
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <PanelIconCalendar className="cc-panel-icon" />
            Yaklaşan Etkinlikler
          </div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">
            Tüm Takvim →
          </Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.calendar.map((item) => (
            <Link
              key={item.id}
              href={economicCalendarEventHref(item.id)}
              className="cc-cal-row cc-cal-row--link"
            >
              <div className="cc-cal-icon" aria-hidden>
                <CalendarTypeBadge type={item.type} />
              </div>
              <div className="cc-cal-info">
                <span className="cc-cal-title">{item.title}</span>
                <span className="cc-cal-date">{item.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
