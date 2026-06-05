"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/states";
import { IntelWorkspaceSkeleton } from "@/features/markets/components/markets-states";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { useEconomicCalendarIntelligence } from "@/features/markets/hooks/use-economic-calendar-intelligence";
import { getCalendarEventExtra, beatsForecast } from "@/features/markets/lib/economic-calendar-extra";
import { economicCalendarEventHref } from "@/features/markets/lib/economic-calendar-shared";
import { isMockDataEnabled } from "@/mock/config";
import { getMockEconomicCalendarExtra } from "@/mock/adapters/markets-workspace";
import { cn } from "@/lib/cn";

/* ================================
   YARDIMCI FONKSİYONLAR
   ================================ */

const FLAGS: Record<string, string> = {
  US:"🇺🇸", EU:"🇪🇺", TR:"🇹🇷", UK:"🇬🇧", CA:"🇨🇦",
  JP:"🇯🇵", DE:"🇩🇪", CN:"🇨🇳", AU:"🇦🇺", GLOBAL:"🌐",
};

function getFlag(country: string): string {
  return FLAGS[country] ?? "🌐";
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDayHeader(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
}

function isUpcoming(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}

/* ================================
   ETKİ DAIRELERI
   ================================ */

function ImpactDots({ impact }: { impact: 1 | 2 | 3 }) {
  const color = impact === 3 ? "#ef4444" : impact === 2 ? "#f97316" : "#64748b";
  return (
    <div className="ec-impact-cell">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="ec-impact-circle"
          style={{ background: i <= impact ? color : "rgba(255,255,255,0.08)" }}
        />
      ))}
    </div>
  );
}

/* ================================
   EVENT TABLE ROW
   ================================ */

type CalRow = {
  id: string;
  at: string;
  country: string;
  title: string;
  impact: 1 | 2 | 3;
  affectedSymbols: readonly string[];
  hitsWatchlist?: boolean;
  previous?: string | null;
  forecast?: string | null;
  actual?: string | null;
  code?: string | null;
};

function EventRow({ ev }: { ev: CalRow }) {
  const mockExtra = getCalendarEventExtra(ev.id);
  const extra = mockExtra ?? (ev.previous || ev.forecast || ev.actual || ev.code
    ? {
        code: ev.code ?? "—",
        category: "growth" as const,
        flag: getFlag(ev.country),
        previous: ev.previous ?? "—",
        forecast: ev.forecast ?? "—",
        actual: ev.actual ?? null,
      }
    : null);
  const upcoming = isUpcoming(ev.at);
  const beat = extra?.actual ? beatsForecast(extra.actual, extra.forecast) : null;

  return (
    <tr className="ec-table-row">
      {/* Saat */}
      <td>
        <span className={cn("ec-time-cell", upcoming && "ec-time-cell--upcoming")}>
          {fmtTime(ev.at)}
        </span>
      </td>

      {/* Ülke */}
      <td>
        <div className="ec-country-cell">
          <span className="ec-country-flag">{getFlag(ev.country)}</span>
          <span className="ec-country-code">{ev.country}</span>
        </div>
      </td>

      {/* Olay + Kategori */}
      <td className="ec-event-cell">
        <Link href={economicCalendarEventHref(ev.id)} className="ecd-event-link">
          <div className="ec-event-title">{ev.title}</div>
        </Link>
        <div className="ec-event-badges">
          {extra && (
            <span className={`ec-cat-badge ec-cat-badge--${extra.category}`}>
              {extra.code}
            </span>
          )}
          {ev.hitsWatchlist && <span className="ec-wl-badge">İZLEME</span>}
          {ev.affectedSymbols.slice(0, 3).map((s) => (
            <span key={s} className="ec-sym-tag">{s}</span>
          ))}
        </div>
      </td>

      {/* Etki */}
      <td><ImpactDots impact={ev.impact} /></td>

      {/* Önceki */}
      <td>
        <span className="ec-num-cell ec-num-cell--prev">
          {extra?.previous ?? "—"}
        </span>
      </td>

      {/* Tahmin */}
      <td>
        <span className="ec-num-cell ec-num-cell--fcst">
          {extra?.forecast ?? "—"}
        </span>
      </td>

      {/* Gerçekleşen */}
      <td>
        {extra?.actual != null ? (
          <span className={cn(
            "ec-num-cell",
            beat === true  ? "ec-num-cell--beat" :
            beat === false ? "ec-num-cell--miss" :
            "ec-num-cell--fcst",
          )}>
            {extra.actual}
            {beat === true  && " ↑"}
            {beat === false && " ↓"}
          </span>
        ) : (
          <span className="ec-num-cell ec-num-cell--pending">Bekleniyor</span>
        )}
      </td>
    </tr>
  );
}

/* ================================
   ANA CLIENT
   ================================ */

export function EconomicCalendarIntelligencePageClient() {
  const mockOn = isMockDataEnabled();
  const { bundle, isLoading, isEmpty } = useEconomicCalendarIntelligence();

  const extraRows = useMemo(() => (mockOn ? getMockEconomicCalendarExtra() : []), [mockOn]);

  /* Tüm eventleri birleştir */
  const allEvents = useMemo<CalRow[]>(() => {
    if (!bundle) return [];
    const base: CalRow[] = bundle.events.map((e) => ({
      id: e.id, at: e.at, country: e.country, title: e.title,
      impact: e.impact as 1 | 2 | 3, affectedSymbols: e.affectedSymbols ?? [],
      hitsWatchlist: e.hitsWatchlist,
      previous: e.historicalMemory !== "—" ? e.historicalMemory : null,
      forecast: e.consensusExpectation !== "—" ? e.consensusExpectation : null,
      actual: e.sentimentAfter !== "—" ? e.sentimentAfter : null,
      code: e.macroTheme !== "—" ? e.macroTheme : null,
    }));
    const ext: CalRow[] = extraRows.map((e) => ({
      id: e.id, at: e.at, country: e.country, title: e.title,
      impact: e.impact as 1|2|3, affectedSymbols: e.affectedSymbols ?? [],
    }));
    const all = [...base, ...ext].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    /* dedupe */
    const seen = new Set<string>();
    return all.filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true; });
  }, [bundle, extraRows]);

  /* Filtre state */
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [impactFilter,  setImpactFilter]  = useState<number>(0);   /* 0=tümü */
  const [timePeriod,    setTimePeriod]    = useState<string>("week");

  /* Filtreli events */
  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      if (countryFilter !== "all" && e.country !== countryFilter) return false;
      if (impactFilter > 0 && e.impact < impactFilter) return false;
      return true;
    });
  }, [allEvents, countryFilter, impactFilter]);

  /* Gün grupla */
  const grouped = useMemo(() => {
    const m = new Map<string, CalRow[]>();
    for (const e of filtered) {
      const day = new Date(e.at).toISOString().slice(0, 10);
      const arr = m.get(day) ?? [];
      arr.push(e);
      m.set(day, arr);
    }
    return m;
  }, [filtered]);

  /* Hero event: impact 3 ve en yakın */
  const heroEvent = useMemo(() => {
    return allEvents.find((e) => e.impact === 3) ?? allEvents[0] ?? null;
  }, [allEvents]);

  /* İstatistikler */
  const highCount = allEvents.filter((e) => e.impact === 3).length;
  const medCount  = allEvents.filter((e) => e.impact === 2).length;
  const wlCount   = allEvents.filter((e) => e.hitsWatchlist).length;

  if (isLoading || !bundle) {
    return <IntelWorkspaceSkeleton rows={6} />;
  }

  if (isEmpty) {
    return (
      <div className="ec-page ms-page-wrapper ms-container-markets min-w-0 py-16">
        <EmptyState
          title="Ekonomik takvim boş"
          description="Bu hafta için planlanmış makro etkinlik henüz yok. CPI, faiz ve istihdam verileri eklendiğinde burada görünecek."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
          compact
        />
      </div>
    );
  }

  const heroExtra = heroEvent ? getCalendarEventExtra(heroEvent.id) : null;

  return (
    <div className="ec-page ms-page-wrapper ms-container-markets min-w-0">

      {/* ===== HEADER ===== */}
      <div className="ec-header">
        <div className="ec-header-left">
          <span className="ec-header-tag">Marketly · Makro</span>
          <h1 className="ec-header-title">Ekonomik Takvim</h1>
        </div>
        <div className="ec-header-actions">
          <Link href="/market-news" className="ec-header-btn">📰 Haberler</Link>
          <Link href="/signals" className="ec-header-btn">📊 Sinyaller</Link>
        </div>
      </div>

      {/* ===== STATS STRIP ===== */}
      <div className="ec-stats-strip">
        <div className="ec-strip-stat">
          <span className="ec-strip-label">Toplam Etkinlik</span>
          <span className="ec-strip-value">{allEvents.length}</span>
          <span className="ec-strip-sub">Bu hafta</span>
        </div>
        <div className="ec-strip-stat">
          <span className="ec-strip-label">Yüksek Etki</span>
          <span className="ec-strip-value" style={{ color: "#ef4444" }}>{highCount}</span>
          <span className="ec-strip-sub">●●● etkinlik</span>
        </div>
        <div className="ec-strip-stat">
          <span className="ec-strip-label">Orta Etki</span>
          <span className="ec-strip-value" style={{ color: "#f97316" }}>{medCount}</span>
          <span className="ec-strip-sub">●● etkinlik</span>
        </div>
        <div className="ec-strip-stat">
          <span className="ec-strip-label">İzleme Kesişimi</span>
          <span className="ec-strip-value" style={{ color: "#0f9d75" }}>{wlCount}</span>
          <span className="ec-strip-sub">portföy/izleme</span>
        </div>
      </div>

      {/* ===== FİLTRE BARI ===== */}
      <div className="ec-filters">
        {/* Ülke */}
        <div className="ec-filter-group">
          <span className="ec-filter-label">Ülke:</span>
          {["all","US","EU","TR","UK","CA"].map((c) => (
            <button key={c} type="button"
              aria-pressed={countryFilter === c}
              className={cn("ec-filter-btn", countryFilter === c && "ec-filter-btn--active")}
              onClick={() => setCountryFilter(c)}>
              {c === "all" ? "Tümü" : `${getFlag(c)} ${c}`}
            </button>
          ))}
        </div>

        <div className="ec-filter-divider" />

        {/* Etki */}
        <div className="ec-filter-group">
          <span className="ec-filter-label">Etki:</span>
          <button type="button" aria-pressed={impactFilter === 0} className={cn("ec-filter-btn", impactFilter === 0 && "ec-filter-btn--active")} onClick={() => setImpactFilter(0)}>Tümü</button>
          <button type="button" aria-pressed={impactFilter === 3} className={cn("ec-filter-btn ec-filter-btn--high", impactFilter === 3 && "active")} onClick={() => setImpactFilter(3)} style={{ color: impactFilter === 3 ? "#ef4444" : undefined, borderColor: impactFilter === 3 ? "#ef4444" : undefined, background: impactFilter === 3 ? "rgba(239,68,68,0.10)" : undefined }}>●●● Yüksek</button>
          <button type="button" aria-pressed={impactFilter === 2} className={cn("ec-filter-btn ec-filter-btn--med",  impactFilter === 2 && "active")} onClick={() => setImpactFilter(2)} style={{ color: impactFilter === 2 ? "#f97316" : undefined, borderColor: impactFilter === 2 ? "#f97316" : undefined, background: impactFilter === 2 ? "rgba(249,115,22,0.10)" : undefined }}>●● Orta</button>
        </div>
      </div>

      {/* ===== HERO EVENT ===== */}
      {heroEvent && (
        <div className="ec-hero-event">
          <div className="ec-hero-impact">
            <ImpactDots impact={heroEvent.impact as 1|2|3} />
            <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              ÖNEMLI
            </span>
          </div>
          <div className="ec-hero-body">
            <div className="ec-hero-time-row">
              <span className="ec-country-flag">{getFlag(heroEvent.country)}</span>
              <span className="ec-country-code">{heroEvent.country}</span>
              <span className="ec-hero-time">{fmtTime(heroEvent.at)}</span>
              {heroExtra && (
                <span className={`ec-cat-badge ec-cat-badge--${heroExtra.category}`}>
                  {heroExtra.code}
                </span>
              )}
              {heroEvent.hitsWatchlist && <span className="ec-wl-badge">İZLEMEDE</span>}
            </div>
            <Link href={economicCalendarEventHref(heroEvent.id)} className="ec-hero-title ecd-event-link">
              {heroEvent.title}
            </Link>
            {heroExtra && (
              <div className="ec-data-row">
                <div className="ec-data-cell">
                  <span className="ec-data-label">Önceki</span>
                  <span className="ec-data-value">{heroExtra.previous}</span>
                </div>
                <div className="ec-data-cell">
                  <span className="ec-data-label">Tahmin</span>
                  <span className="ec-data-value">{heroExtra.forecast}</span>
                </div>
                {heroExtra.actual ? (
                  <div className="ec-data-cell">
                    <span className="ec-data-label">Gerçekleşen</span>
                    <span className={cn("ec-data-value",
                      beatsForecast(heroExtra.actual, heroExtra.forecast) === true ? "ec-data-value--beat" :
                      beatsForecast(heroExtra.actual, heroExtra.forecast) === false ? "ec-data-value--miss" : ""
                    )}>
                      {heroExtra.actual}
                    </span>
                  </div>
                ) : (
                  <div className="ec-data-cell">
                    <span className="ec-data-label">Gerçekleşen</span>
                    <span className="ec-data-value ec-data-value--pending">Bekleniyor</span>
                  </div>
                )}
                {heroEvent.affectedSymbols.length > 0 && (
                  <div className="ec-data-cell">
                    <span className="ec-data-label">Etkilenen</span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
                      {heroEvent.affectedSymbols.slice(0, 4).map((s) => (
                        <Link key={s} href={`/markets/${encodeURIComponent(s)}`} className="ec-sym-tag" style={{ fontSize: 11 }}>
                          {s}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== GÜN GRUPLARI + TABLO ===== */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Etkinlik bulunamadı"
          description="Seçili filtrelere uygun makro etkinlik yok."
          actionLabel="Filtreleri sıfırla"
          onAction={() => { setCountryFilter("all"); setImpactFilter(0); }}
          tone="market"
          compact
        />
      ) : (
        [...grouped.entries()].map(([day, events]) => (
          <div key={day} className="ec-day-section">
            <div className="ec-day-header">
              <span className="ec-day-label">{fmtDayHeader(events[0]!.at)}</span>
              <div className="ec-day-line" />
              <span className="ec-day-count">{events.length} etkinlik</span>
            </div>

            <div className="ec-table-wrap">
              <table className="ec-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Saat</th>
                    <th style={{ width: 70 }}>Ülke</th>
                    <th>Etkinlik</th>
                    <th className="center" style={{ width: 70 }}>Etki</th>
                    <th className="right" style={{ width: 80 }}>Önceki</th>
                    <th className="right" style={{ width: 80 }}>Tahmin</th>
                    <th className="right" style={{ width: 100 }}>Gerçekleşen</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <EventRow key={ev.id} ev={ev} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

    </div>
  );
}
