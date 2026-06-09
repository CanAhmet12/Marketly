"use client";

import Link from "next/link";

import { marketNewsDetailHref } from "@/features/markets/lib/market-news-shared";

import type { EconomicCalendarRow, MarketNewsRow, PortfolioStripRow } from "@/features/markets/repository";

type Props = {
  calendar: EconomicCalendarRow[];
  news: MarketNewsRow[];
  portfolio: PortfolioStripRow[];
};

export function MarketsContextRail({ calendar, news, portfolio }: Props) {
  const stripHint = portfolio.map((p) => p.hint).find(Boolean);
  return (
    <div className="grid min-w-0 gap-[var(--sp-3)] min-[1100px]:grid-cols-3">
      <section className="min-w-0 rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
        <div className="mb-[var(--sp-2)] flex items-center justify-between gap-[var(--sp-2)]">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Ekonomik takvim</h3>
          <Link href="/economic-calendar" className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
            Tümü
          </Link>
        </div>
        <ul className="m-0 list-none space-y-[var(--sp-2)] p-0">
          {calendar.slice(0, 4).map((e) => (
            <li key={e.id} className="text-[12px]">
              <p className="font-semibold text-[var(--color-text)]">{e.title}</p>
              <p className="mt-0.5 text-[11px] font-medium text-[var(--color-meta)]">
                {e.country} · {new Date(e.at).toLocaleString("tr-TR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · Etki{" "}
                {e.impact}
              </p>
              {e.affectedSymbols?.length ? (
                <p className="mt-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  Sembol: {e.affectedSymbols.slice(0, 5).join(", ")}
                </p>
              ) : null}
              {e.volatilityHint ? <p className="mt-0.5 text-[11px] font-medium leading-snug text-[var(--color-meta)]">{e.volatilityHint}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="min-w-0 rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
        <div className="mb-[var(--sp-2)] flex items-center justify-between gap-[var(--sp-2)]">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Piyasa haberi</h3>
          <Link href="/market-news" className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
            Akış
          </Link>
        </div>
        <ul className="m-0 list-none space-y-[var(--sp-2)] p-0">
          {news.slice(0, 4).map((n) => (
            <li key={n.id}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {n.impactTier ? (
                  <span className="rounded bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Etki {n.impactTier}
                  </span>
                ) : null}
                <Link href={marketNewsDetailHref(n.id)} className="block min-w-0 flex-1 text-[12px] font-semibold leading-snug text-[var(--color-text)] hover:text-[var(--color-primary-dark)]">
                  <span className="text-[var(--color-primary-dark)]">{n.symbol}</span> · {n.headline}
                </Link>
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--color-meta)]">
                {n.source} · {n.minutesAgo} dk
              </p>
              {n.affectedSymbols?.length ? (
                <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                  {n.affectedSymbols.slice(0, 4).join(" · ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="min-w-0 rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
        <div className="mb-[var(--sp-2)] flex items-center justify-between gap-[var(--sp-2)]">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Portföy özeti</h3>
          <Link href="/portfolio" className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
            Detay
          </Link>
        </div>
        <ul className="m-0 list-none space-y-[var(--sp-2)] p-0">
          {portfolio.map((p, i) => (
            <li key={i} className="flex items-baseline justify-between gap-[var(--sp-2)] text-[12px]">
              <span className="font-medium text-[var(--color-text-secondary)]">{p.label}</span>
              <span className="markets-mono font-bold text-[var(--color-text)]">{p.value}</span>
            </li>
          ))}
        </ul>
        {stripHint ? <p className="mt-[var(--sp-2)] text-[11px] font-medium text-[var(--color-meta)]">{stripHint}</p> : null}
      </section>
    </div>
  );
}
