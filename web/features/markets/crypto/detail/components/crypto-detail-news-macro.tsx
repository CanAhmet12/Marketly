"use client";

import Link from "next/link";
import { useMemo } from "react";

import { CalendarTypeBadge, PanelIconCalendar, PanelIconNews } from "@/features/markets/crypto/components/crypto-editorial-icons";
import { buildCryptoNewsMacro } from "@/features/markets/crypto/detail/lib/build-crypto-news-macro";
import { useCryptoDetailMacroEvents } from "@/features/markets/crypto/detail/hooks/use-crypto-detail-macro-events";
import type { CryptoNewsMacroItem } from "@/features/markets/crypto/detail/lib/crypto-news-macro-types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = { bundle: AssetIntelligenceBundle };

function impactClass(impact: 1 | 2 | 3): string {
  if (impact === 3) return "cd-news-card--high";
  if (impact === 2) return "cd-news-card--medium";
  return "";
}

function sentimentClass(sentiment: string): string {
  if (sentiment === "positive") return "cd-news-sentiment--up";
  if (sentiment === "negative") return "cd-news-sentiment--down";
  if (sentiment === "mixed") return "cd-news-sentiment--mixed";
  return "cd-news-sentiment--neutral";
}

function formatMinutesAgo(m: number): string {
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s önce`;
  return `${Math.floor(h / 24)}g önce`;
}

function NewsCard({ item, featured = false }: { item: CryptoNewsMacroItem; featured?: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn("cd-news-card", impactClass(item.impact), featured && "cd-news-card--featured")}
    >
      <div className="cd-news-card-meta">
        <span className="cd-news-cat">{item.categoryLabel}</span>
        <span className="cd-news-dot" aria-hidden>
          ·
        </span>
        <span className="cd-news-source">{item.source}</span>
        <span className="cd-news-dot" aria-hidden>
          ·
        </span>
        <span className="cd-news-time">{formatMinutesAgo(item.minutesAgo)}</span>
        {item.impact >= 3 ? <span className="cd-news-impact">Yüksek etki</span> : null}
      </div>
      <p className="cd-news-headline">{item.headline}</p>
      <span className={cn("cd-news-sentiment", sentimentClass(item.sentiment))}>{item.sentimentLabel}</span>
    </Link>
  );
}

export function CryptoDetailNewsMacro({ bundle }: Props) {
  const calendarRows = useCryptoDetailMacroEvents(bundle.asset.symbol);
  const payload = useMemo(
    () => buildCryptoNewsMacro(bundle, calendarRows),
    [bundle, calendarRows],
  );

  const newsCount = (payload.featured ? 1 : 0) + payload.news.length;
  const hasNews = newsCount > 0;
  const hasEvents = payload.events.length > 0;

  return (
    <section className="cd-news-macro cd-news-v3" role="region" aria-label="Haber ve makro">

      {payload.macroThemes.length > 0 ? (
        <div className="cd-news-macro-themes" aria-label="Makro temalar">
          {payload.macroThemes.map((t) => (
            <span key={t} className="cd-news-macro-theme">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="cd-news-macro-grid">
        <div className="cd-news-panel">
          <div className="cd-news-panel-head">
            <PanelIconNews className="cd-news-panel-icon" />
            <span>Coin haberleri</span>
            {newsCount > 0 ? <span className="cd-news-panel-count">{newsCount}</span> : null}
          </div>

          {!hasNews ? (
            <p className="cd-news-empty">Bu varlık için haber bulunamadı.</p>
          ) : (
            <>
              {payload.featured ? <NewsCard item={payload.featured} featured /> : null}
              {payload.news.length > 0 ? (
                <div className="cd-news-list">
                  {payload.news.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="cd-macro-panel">
          <div className="cd-news-panel-head">
            <PanelIconCalendar className="cd-news-panel-icon" />
            <span>Yaklaşan etkinlikler</span>
            {payload.events.length > 0 ? (
              <span className="cd-news-panel-count">{payload.events.length}</span>
            ) : null}
          </div>

          {!hasEvents ? (
            <p className="cd-news-empty">Yakın pencerede makro etkinlik yok.</p>
          ) : (
            <ul className="cd-macro-event-list">
              {payload.events.map((ev) => (
                <li key={ev.id}>
                  <Link href={ev.href} className="cd-macro-event-row">
                    <div className="cd-macro-event-icon" aria-hidden>
                      <CalendarTypeBadge type={ev.type} />
                    </div>
                    <div className="cd-macro-event-body">
                      <span className="cd-macro-event-title">{ev.title}</span>
                      <span className="cd-macro-event-meta">
                        {ev.country} · {ev.dateLabel}
                        {ev.affectsSymbol ? " · Doğrudan etki" : null}
                      </span>
                      {ev.volatilityHint ? (
                        <span className="cd-macro-event-hint">{ev.volatilityHint}</span>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "cd-macro-impact",
                        ev.impact === 3 && "cd-macro-impact--high",
                        ev.impact === 2 && "cd-macro-impact--mid",
                      )}
                    >
                      {ev.impactLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
