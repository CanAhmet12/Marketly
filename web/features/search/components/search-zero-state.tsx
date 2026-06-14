"use client";

import Link from "next/link";

import { SearchInlineField } from "@/features/search/components/search-inline-field";
import { buildSearchUrl } from "@/features/search/lib/search-url";
import { SEARCH_TREND_TILES, SEARCH_ZERO_SHORTCUTS, type SearchZeroShortcut } from "@/features/search/lib/search-zero-data";
import { useRecentSearches } from "@/features/search/hooks/use-recent-searches";
import { cn } from "@/lib/cn";

function ShortcutIcon({ icon }: { icon: SearchZeroShortcut["icon"] }) {
  if (icon === "creators") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "videos") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="6" width="14" height="12" rx="2" />
        <path d="M17 10l4-2v8l-4-2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "signals") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 18l4-8 4 5 4-9 4 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 18V6l8 4 8-4v12" strokeLinejoin="round" />
      <path d="M12 10v8" />
    </svg>
  );
}

export function SearchZeroState() {
  const { recent, removeRecent, clearRecent } = useRecentSearches();

  return (
    <div className="srch-zero">
      <section className="srch-hero" aria-label="Arama">
        <div className="srch-hero__mesh" aria-hidden />
        <div className="srch-hero__content">
          <p className="srch-hero__eyebrow">Keşif terminali</p>
          <h1 className="srch-hero__title">Ne aramak istiyorsun?</h1>
          <p className="srch-hero__desc">Sembol, üretici, video veya tartışma konusu — tek sorguda keşfet.</p>
          <SearchInlineField />
        </div>
      </section>

      {recent.length > 0 ? (
        <section className="srch-zero__block" aria-label="Son aramalar">
          <div className="srch-zero__section-head">
            <h2 className="srch-zero__section-title">Son aramalar</h2>
            <button type="button" className="srch-zero__section-action" onClick={clearRecent}>
              Temizle
            </button>
          </div>
          <div className="srch-pill-rail">
            {recent.map((q) => (
              <span key={q} className="srch-pill">
                <Link href={buildSearchUrl(q, "all")} className="srch-pill__link">
                  {q}
                </Link>
                <button
                  type="button"
                  className="srch-pill__remove"
                  aria-label={`${q} kaldır`}
                  onClick={() => removeRecent(q)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="srch-zero__block" aria-label="Trend aramalar">
        <h2 className="srch-zero__section-title">Trend aramalar</h2>
        <div className="srch-trend-grid">
          {SEARCH_TREND_TILES.map((t) => (
            <Link
              key={t.q}
              href={buildSearchUrl(t.q, "all")}
              className={cn("srch-trend-tile", `srch-trend-tile--${t.tone}`)}
            >
              <span className="srch-trend-tile__symbol">{t.symbol}</span>
              <span className="srch-trend-tile__label">{t.label}</span>
              <span className="srch-trend-tile__tag">{t.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="srch-zero__block" aria-label="Keşfet kısayolları">
        <h2 className="srch-zero__section-title">Keşfet</h2>
        <div className="srch-shortcut-grid">
          {SEARCH_ZERO_SHORTCUTS.map((d) => (
            <Link key={d.href} href={d.href} className="srch-shortcut">
              <span className={cn("srch-shortcut__icon", `srch-shortcut__icon--${d.icon}`)}>
                <ShortcutIcon icon={d.icon} />
              </span>
              <span className="srch-shortcut__copy">
                <span className="srch-shortcut__label">{d.label}</span>
                <span className="srch-shortcut__desc">{d.desc}</span>
              </span>
              <span className="srch-shortcut__arrow" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
