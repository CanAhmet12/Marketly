"use client";

import Link from "next/link";

import { MarketNewsWireRow } from "@/features/markets/components/market-news/market-news-wire-row";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  PanelIconCalendar,
  PanelIconNews,
  PanelIconWatchlist,
} from "@/features/markets/crypto/components/crypto-editorial-icons";
import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import type { ForexBottomStripPayload } from "@/features/markets/forex/types";
import { economicCalendarEventHref } from "@/features/markets/lib/economic-calendar-shared";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  strip: ForexBottomStripPayload;
  newsIntel?: readonly MarketNewsIntelligenceItem[];
};

const IMPACT_CLASS: Record<string, string> = {
  high: "fc-cal-impact--high",
  medium: "fc-cal-impact--medium",
  low: "fc-cal-impact--low",
};

const COUNTRY_FLAG: Record<string, string> = {
  US: "🇺🇸",
  EU: "🇪🇺",
  TR: "🇹🇷",
  GB: "🇬🇧",
  JP: "🇯🇵",
  CH: "🇨🇭",
  AU: "🇦🇺",
  CA: "🇨🇦",
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtRate(n: number, pair: string) {
  if (!n) return "—";
  return formatForexTickerPrice(n, pair.replace("/", ""));
}

function fmtCommodityPrice(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(2);
}

function pairToSymbol(pair: string): string {
  return pair.replace("/", "");
}

export function ForexBottomStrip({ strip, newsIntel }: Props) {
  const hasIntelNews = newsIntel && newsIntel.length > 0;
  const hasCommodities = strip.commodities.length > 0;

  return (
    <div
      className={cn(
        "cc-bottom-strip cc-section fc-bottom-strip",
        hasCommodities && "fc-bottom-strip--quad",
      )}
      role="region"
      aria-label="İzleme, haberler ve makro takvim"
    >
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
            <p className="fc-bottom-empty">Parite ekleyin</p>
          ) : (
            strip.watchlist.map((item) => (
              <Link
                key={item.pair}
                href={`/markets/${encodeURIComponent(pairToSymbol(item.pair))}`}
                className="cc-watchlist-item"
                aria-label={`${item.pair} detayı`}
              >
                <span className="fc-watchlist-pair-badge">{item.pair.split("/")[0]}</span>
                <span className="cc-watchlist-symbol">{item.pair}</span>
                <span className="cc-watchlist-price">{fmtRate(item.rate, item.pair)}</span>
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
            Forex &amp; Makro Haberleri
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
          <p className="fc-bottom-empty">Canlı haber akışı yükleniyor</p>
        )}
      </div>

      <div className="cc-bottom-panel">
        <div className="cc-bottom-panel-header">
          <div className="cc-bottom-panel-title">
            <PanelIconCalendar className="cc-panel-icon" />
            Merkez Bankası Takvimi
          </div>
          <Link href="/economic-calendar" className="cc-bottom-panel-link">
            Tüm Takvim →
          </Link>
        </div>
        <div className="cc-calendar-rows">
          {strip.centralBanks.length === 0 ? (
            <p className="fc-bottom-empty">Yakın etkinlik yok</p>
          ) : (
            strip.centralBanks.map((item) => (
              <Link
                key={item.id}
                href={economicCalendarEventHref(item.id)}
                className="cc-cal-row cc-cal-row--link fc-cal-row"
              >
                <div className="cc-cal-icon fc-cal-icon" aria-hidden>
                  {COUNTRY_FLAG[item.country] ?? "🌐"}
                </div>
                <div className="cc-cal-info">
                  <div className="fc-cal-meta">
                    <span className="fc-cal-time">{item.time}</span>
                    <span className="fc-cal-bank">{item.bank}</span>
                    <span
                      className={cn("fc-cal-impact-dot", IMPACT_CLASS[item.impact])}
                      aria-hidden
                    />
                  </div>
                  <span className="cc-cal-title">{item.title}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {hasCommodities ? (
        <div className="cc-bottom-panel fc-bottom-panel--commodities">
          <div className="cc-bottom-panel-header">
            <div className="cc-bottom-panel-title">Emtia Korelasyonu</div>
          </div>
          <div className="fc-commodity-grid">
            {strip.commodities.map((item) => (
              <div key={item.symbol} className="fc-commodity-row">
                <div className="fc-commodity-meta">
                  <span className="fc-commodity-symbol">{item.symbol}</span>
                  {item.unit ? <span className="fc-commodity-unit">{item.unit}</span> : null}
                </div>
                <div className="fc-commodity-values">
                  <span className="fc-commodity-price">{fmtCommodityPrice(item.price)}</span>
                  <span className={cn("fc-commodity-change", item.changePct >= 0 ? "cc-up" : "cc-down")}>
                    {signed(item.changePct)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
