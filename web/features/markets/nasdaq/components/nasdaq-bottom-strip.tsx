"use client";

import Link from "next/link";

import { MarketNewsWireRow } from "@/features/markets/components/market-news/market-news-wire-row";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  PanelIconCalendar,
  PanelIconNews,
  PanelIconWatchlist,
} from "@/features/markets/crypto/components/crypto-editorial-icons";
import type { NasdaqBottomStripPayload } from "@/features/markets/nasdaq/types";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  strip: NasdaqBottomStripPayload;
  newsIntel?: readonly MarketNewsIntelligenceItem[];
};

const IMPACT_CLASS: Record<string, string> = {
  high: "nq-cal-impact--high",
  medium: "nq-cal-impact--medium",
  low: "nq-cal-impact--low",
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

export function NasdaqBottomStrip({ strip, newsIntel }: Props) {
  const hasIntelNews = newsIntel && newsIntel.length > 0;

  return (
    <div className="cc-bottom-strip cc-section nq-bottom-strip" role="region" aria-label="İzleme, haberler ve kazanç takvimi">
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
            <p className="nq-bottom-empty">Hisse ekleyin</p>
          ) : (
            strip.watchlist.map((item) => (
              <Link
                key={item.symbol}
                href={`/markets/${encodeURIComponent(item.symbol)}`}
                className="cc-watchlist-item"
                aria-label={`${item.symbol} detayı`}
              >
                <span className="nq-watchlist-symbol-badge">{item.symbol.slice(0, 2)}</span>
                <span className="cc-watchlist-symbol">{item.symbol}</span>
                <span className="cc-watchlist-price">{fmtPrice(item.price)}</span>
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
            Tech &amp; Makro Haberleri
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
          <p className="nq-bottom-empty">Canlı haber akışı yükleniyor</p>
        )}
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <PanelIconCalendar className="cc-panel-icon" />
            Kazanç Takvimi
          </div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">
            Tüm Takvim →
          </Link>
        </div>
        <div className="nq-earnings-list">
          {strip.earnings.length === 0 ? (
            <p className="nq-bottom-empty">Yakın kazanç yok</p>
          ) : (
            strip.earnings.map((item) => (
              <Link
                key={item.id}
                href={`/markets/${encodeURIComponent(item.ticker)}`}
                className="nq-earnings-row nq-earnings-row--link"
              >
                <span className="nq-earnings-ticker">{item.ticker}</span>
                <div className="nq-earnings-info">
                  <span className="nq-earnings-name">{item.name}</span>
                  <span className="nq-earnings-date">
                    {item.date} · {item.timing === "AMC" ? "Kapanış Sonrası" : "Açılış Öncesi"}
                  </span>
                </div>
                <span className="nq-earnings-est">{item.epsEst}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">Makro &amp; Fed</div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">
            Tüm Takvim →
          </Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.macroFed.length === 0 ? (
            <p className="nq-bottom-empty">Yakın etkinlik yok</p>
          ) : (
            strip.macroFed.map((item) => (
              <div key={item.id} className="cc-cal-row nq-cal-row">
                <div className="cc-cal-icon nq-cal-icon" aria-hidden>
                  🇺🇸
                </div>
                <div className="cc-cal-info">
                  <div className="nq-cal-meta">
                    <span className="nq-cal-date">{item.date}</span>
                    <span className={cn("nq-cal-impact-dot", IMPACT_CLASS[item.impact])} aria-hidden />
                  </div>
                  <span className="cc-cal-title">{item.title}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
