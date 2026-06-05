"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { IntelWorkspaceSkeleton } from "@/features/markets/components/markets-states";
import { useEconomicCalendarEventDetail } from "@/features/markets/hooks/use-economic-calendar-event-detail";
import {
  beatsForecast,
  CALENDAR_CATEGORY_LABEL,
  getCalendarEventExtra,
} from "@/features/markets/lib/economic-calendar-extra";
import {
  economicCalendarEventHref,
  eventIntelBullets,
  formatEventTime,
  impactLabel,
} from "@/features/markets/lib/economic-calendar-shared";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import type { EconomicCalendarIntelEvent } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type Props = { eventId: string };

function ImpactDots({ impact }: { impact: 1 | 2 | 3 }) {
  return (
    <span className="ecd-impact-dots" aria-label={impactLabel(impact)}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={cn("ecd-impact-dot", n <= impact && `ecd-impact-dot--${impact}`)} />
      ))}
    </span>
  );
}

function DataStrip({ extra }: { extra: ReturnType<typeof getCalendarEventExtra> }) {
  if (!extra) return null;
  const beat = extra.actual ? beatsForecast(extra.actual, extra.forecast) : null;

  return (
    <div className="ecd-data-strip" role="group" aria-label="Veri karşılaştırması">
      <div className="ecd-data-cell">
        <span className="ecd-data-label">Önceki</span>
        <span className="ecd-data-value ecd-data-value--prev">{extra.previous}</span>
      </div>
      <div className="ecd-data-cell">
        <span className="ecd-data-label">Tahmin</span>
        <span className="ecd-data-value ecd-data-value--fcst">{extra.forecast}</span>
      </div>
      <div className="ecd-data-cell">
        <span className="ecd-data-label">Gerçekleşen</span>
        {extra.actual != null ? (
          <span
            className={cn(
              "ecd-data-value",
              beat === true && "ecd-data-value--beat",
              beat === false && "ecd-data-value--miss",
            )}
          >
            {extra.actual}
            {beat === true ? " ↑" : beat === false ? " ↓" : ""}
          </span>
        ) : (
          <span className="ecd-data-value ecd-data-value--pending">Bekleniyor</span>
        )}
      </div>
    </div>
  );
}

function RelatedRow({ ev }: { ev: EconomicCalendarIntelEvent }) {
  const extra = getCalendarEventExtra(ev.id);
  return (
    <Link href={economicCalendarEventHref(ev.id)} className="ecd-related-row">
      <span className="ecd-related-time">{formatEventTime(ev.at)}</span>
      <span className="ecd-related-title">{ev.title}</span>
      <ImpactDots impact={ev.impact} />
    </Link>
  );
}

export function EconomicCalendarEventDetailClient({ eventId }: Props) {
  const { event, related, narrativeShift, isLoading, notFound } = useEconomicCalendarEventDetail(eventId);

  if (isLoading) return <IntelWorkspaceSkeleton rows={6} />;

  if (notFound || !event) {
    return (
      <div className="ecd-page ms-page-wrapper ms-container-markets min-w-0 py-16">
        <EmptyState
          title="Etkinlik bulunamadı"
          description="Takvim güncellenmiş olabilir."
          actionLabel="Takvime dön"
          actionHref="/economic-calendar"
          tone="market"
          compact
        />
      </div>
    );
  }

  const extra = getCalendarEventExtra(event.id);
  const bullets = eventIntelBullets(event);
  const sym0 = event.affectedSymbols[0] ?? "SPX";

  return (
    <article className="ecd-page ms-page-wrapper ms-container-markets min-w-0">
      <header className="ecd-topbar">
        <Link href="/economic-calendar" className="ecd-back">
          ← Ekonomik Takvim
        </Link>
        <div className="ecd-topbar-actions">
          <Link href="/market-news" className="ecd-topbar-btn">
            📰 Haberler
          </Link>
          <Link href="/signals" className="ecd-topbar-btn">
            📊 Sinyaller
          </Link>
        </div>
      </header>

      <div className="ecd-hero">
        <div className="ecd-hero-meta">
          <span className="ecd-flag">{extra?.flag ?? "🌐"}</span>
          <span className="ecd-country">{event.country}</span>
          {extra ? (
            <span className={`ecd-cat-badge ecd-cat-badge--${extra.category}`}>
              {CALENDAR_CATEGORY_LABEL[extra.category]}
            </span>
          ) : null}
          <ImpactDots impact={event.impact} />
          {event.hitsWatchlist ? <span className="ecd-wl-badge">İZLEME</span> : null}
          {event.hitsPortfolio ? <span className="ecd-pf-badge">PORTFÖY</span> : null}
        </div>
        <h1 className="ecd-title">{event.title}</h1>
        <p className="ecd-time">{formatEventTime(event.at)}</p>
        <p className="ecd-theme">
          Makro tema: <strong>{event.macroTheme}</strong> · {narrativeShift}
        </p>
      </div>

      <DataStrip extra={extra} />

      {bullets.length > 0 ? (
        <aside className="ecd-intel-summary" aria-label="Etkinlik özeti">
          <p className="ecd-intel-label">Piyasa beklentisi</p>
          <ul className="ecd-intel-list">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <div className="ecd-layout">
        <div className="ecd-main">
          <section className="ecd-section">
            <h2 className="ecd-section-title">Tarihsel hafıza</h2>
            <p className="ecd-prose">{event.historicalMemory}</p>
          </section>

          <section className="ecd-section">
            <h2 className="ecd-section-title">Volatilite & pozisyonlama</h2>
            <p className="ecd-prose">{event.volatilityExpectation}</p>
            <p className="ecd-prose ecd-prose--muted">{event.positioningLabel}</p>
          </section>

          <section className="ecd-section">
            <h2 className="ecd-section-title">Sentiment akışı</h2>
            <div className="ecd-sentiment-row">
              <div className="ecd-sentiment-card">
                <span className="ecd-sentiment-label">Öncesi</span>
                <p>{event.sentimentBefore}</p>
              </div>
              <div className="ecd-sentiment-card">
                <span className="ecd-sentiment-label">Sonrası (beklenti)</span>
                <p>{event.sentimentAfter}</p>
              </div>
            </div>
          </section>

          <section className="ecd-section">
            <h2 className="ecd-section-title">Ağ etkisi</h2>
            <p className="ecd-prose">{event.networkHint}</p>
          </section>

          {event.discussionRows.length > 0 ? (
            <section className="ecd-section">
              <h2 className="ecd-section-title">Tartışma bağlantıları</h2>
              <ul className="ecd-discussion-list">
                {event.discussionRows.map((d) => (
                  <li key={d.id}>
                    <Link href={d.href} className="ecd-discussion-link">
                      <span className="ecd-discussion-label">{d.label}</span>
                      <span className="ecd-discussion-stance">{d.stance}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {event.creatorCommentary.length > 0 ? (
            <section className="ecd-section">
              <h2 className="ecd-section-title">Üretici yorumları</h2>
              <ul className="ecd-commentary-list">
                {event.creatorCommentary.map((c) => (
                  <li key={c.display} className="ecd-commentary-item">
                    <Link href={c.href} className="ecd-commentary-author">
                      {c.display}
                    </Link>
                    <p className="ecd-commentary-note">{c.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="ecd-rail" aria-label="Etkinlik bağlamı">
          <div className="ecd-rail-block">
            <h3 className="ecd-rail-title">Hızlı aksiyonlar</h3>
            <nav className="ecd-action-nav">
              <Link href={`/markets/${encodeURIComponent(sym0)}`}>Grafik & varlık →</Link>
              <Link href={event.relatedSignalsHref || `/signals?asset=${encodeURIComponent(sym0)}`}>
                {event.relatedSignalsLabel} →
              </Link>
              <Link href="/market-news">İlgili haberler →</Link>
            </nav>
          </div>

          <div className="ecd-rail-block">
            <h3 className="ecd-rail-title">Etkilenen semboller</h3>
            <div className="ecd-sym-grid">
              {event.affectedSymbols.map((s) => (
                <Link key={s} href={`/markets/${encodeURIComponent(s)}`} className="ecd-sym-pill">
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {related.length > 0 ? (
            <div className="ecd-rail-block">
              <h3 className="ecd-rail-title">Aynı bölgede yaklaşan</h3>
              <div className="ecd-related-stack">
                {related.map((ev) => (
                  <RelatedRow key={ev.id} ev={ev} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
