"use client";

import Link from "next/link";

import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { buildSearchUrl } from "@/features/search/lib/search-url";
import { useRecentSearches } from "@/features/search/hooks/use-recent-searches";

const TREND_CHIPS = [
  { q: "Bitcoin", label: "Bitcoin" },
  { q: "BIST100", label: "BIST100" },
  { q: "ETH", label: "Ethereum" },
  { q: "TSLA", label: "Tesla" },
  { q: "Altın", label: "Altın" },
  { q: "Nasdaq", label: "Nasdaq" },
];

const SHORTCUTS = [
  { href: DISCOVER_VERTICAL_ROUTES.creators, label: "Üreticiler" },
  { href: DISCOVER_VERTICAL_ROUTES.videos, label: "Videolar" },
  { href: DISCOVER_VERTICAL_ROUTES.signals, label: "Sinyaller" },
  { href: "/markets", label: "Piyasalar" },
];

export function SearchZeroState() {
  const { recent, removeRecent, clearRecent } = useRecentSearches();

  return (
    <div className="sch-zero">
      <header className="creators-page__head sch-zero__head">
        <div className="creators-page__head-row">
          <div className="creators-page__head-main">
            <h1 className="creators-page__title">Arama</h1>
          </div>
          <p className="creators-page__desc">Üst çubuktan sembol, üretici, video veya konu arayın.</p>
        </div>
      </header>

      {recent.length > 0 ? (
        <section className="sch-zero__block" aria-label="Son aramalar">
          <div className="creators-page__section-head">
            <h2 className="creators-page__section-title">Son aramalar</h2>
            <button type="button" className="creators-page__section-link sch-zero__clear-btn" onClick={clearRecent}>
              Temizle
            </button>
          </div>
          <div className="sch-toolbar sch-toolbar--wrap">
            {recent.map((q) => (
              <span key={q} className="sch-zero__recent-wrap">
                <Link href={buildSearchUrl(q, "all")} className="creators-page__chip">
                  {q}
                </Link>
                <button
                  type="button"
                  className="sch-zero__recent-remove"
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

      <section className="sch-zero__block" aria-label="Trend aramalar">
        <h2 className="creators-page__section-title sch-zero__label">Trend aramalar</h2>
        <div className="sch-toolbar sch-toolbar--wrap">
          {TREND_CHIPS.map((t) => (
            <Link key={t.q} href={buildSearchUrl(t.q, "all")} className="creators-page__chip">
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="sch-zero__block" aria-label="Keşfet kısayolları">
        <h2 className="creators-page__section-title sch-zero__label">Keşfet</h2>
        <div className="sch-zero__shortcuts">
          {SHORTCUTS.map((d) => (
            <Link key={d.href} href={d.href} className="sch-zero__shortcut">
              {d.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
