"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getHomeRepository } from "@/features/home/repository";
import type { StoryRing } from "@/features/home/repository/types";

function HighlightItem({
  ring,
  index,
}: {
  ring: StoryRing;
  index: number;
}) {
  const isNew = index < 2;
  return (
    <Link
      href={ring.href}
      className="group/ms-hl relative flex w-[5rem] shrink-0 flex-col items-center gap-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
    >
      {isNew ? (
        <span className="absolute -right-0.5 -top-0.5 z-[1] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_88%,#0a0a0c)] px-1 py-px text-[9px] font-bold uppercase tracking-wide text-[var(--color-bg)] shadow-sm">
          Yeni
        </span>
      ) : null}
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full p-[3px] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-divider)_30%,transparent)] transition-[box-shadow,transform] duration-200 group-hover/ms-hl:-translate-y-0.5 group-hover/ms-hl:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-primary)_42%,transparent)]"
        style={{
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 50%, transparent), color-mix(in srgb, var(--color-primary-dark) 65%, #12121a))",
        }}
      >
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-bg-elevated)_92%,var(--color-primary)_8%)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_38%,transparent)]">
          {ring.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- story thumb
            <img src={ring.thumbnail_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[12px] font-bold tabular-nums text-[var(--color-text-secondary)]">{ring.label.slice(0, 2)}</span>
          )}
        </div>
      </div>
      <span className="line-clamp-2 w-full px-0.5 text-[13px] font-semibold leading-snug text-[var(--color-text-secondary)] transition-colors group-hover/ms-hl:text-[var(--color-text)]">
        {ring.label}
      </span>
    </Link>
  );
}

const FALLBACK: { href: string; label: string; abbr: string }[] = [
  { href: "/discover?tab=creators", label: "Üretici keşfi", abbr: "Ü" },
  { href: "/discover", label: "Gündem akışı", abbr: "G" },
  { href: "/markets", label: "Piyasa özeti", abbr: "P" },
  { href: "/results?q=BTC", label: "Kripto · BTC", abbr: "₿" },
  { href: "/results?q=XU100", label: "Borsa · XU100", abbr: "X" },
];

/**
 * Home-only: “boş daire” hissi yerine öne çıkan / hikâye şeridi.
 */
export function HomeHighlightRail({ userId }: { userId: string | null }) {
  const rings = useMemo(() => getHomeRepository().getStories(userId), [userId]);
  const display = rings.length > 0 ? rings : null;

  return (
    <section className="ms-home-highlight-rail border-b border-[color-mix(in_srgb,var(--color-divider)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-subtle)_62%,transparent)] py-2.5 sm:py-3">
      <div className="flex items-end justify-between gap-3 px-0.5 sm:px-0">
        <div className="min-w-0">
          <h2 className="text-[16px] font-bold tracking-[-0.022em] text-[var(--color-text)] sm:text-[17px]">Gündem şeridi</h2>
          <p className="mt-0.5 text-[12px] font-medium leading-snug text-[var(--color-meta)] sm:text-[13px]">Canlı akış, üreticiler, semboller</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/upload"
            className="hidden min-h-9 items-center rounded-full border border-[color-mix(in_srgb,var(--color-divider)_38%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-elevated)_45%,transparent)] px-3 text-[12px] font-semibold text-[var(--color-text-secondary)] shadow-sm outline-none transition-[border-color,background-color,color] hover:border-[color-mix(in_srgb,var(--color-primary)_32%,transparent)] hover:text-[var(--color-text)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] sm:inline-flex"
          >
            Ekle
          </Link>
          <Link
            href="/discover"
            className="inline-flex min-h-9 items-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 text-[12px] font-semibold text-[var(--color-primary)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_45%,transparent)]"
          >
            Tümü
          </Link>
        </div>
      </div>
      <div className="ms-home-highlight-rail__strip mt-2.5 flex gap-3 overflow-x-auto overscroll-x-contain pb-1 pl-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-3 sm:gap-3.5">
        {display
          ? display.map((r, i) => <HighlightItem key={r.id} ring={r} index={i} />)
          : FALLBACK.map((m, i) => (
              <Link
                key={m.href}
                href={m.href}
                className="group/ms-hl flex w-[5rem] shrink-0 flex-col items-center gap-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
              >
                {i < 2 ? (
                  <span className="relative">
                    <span className="absolute -right-0.5 -top-0.5 z-[1] flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-[0_0_0_2px_var(--color-bg)] ring-2 ring-[color-mix(in_srgb,var(--color-primary)_45%,transparent)]" aria-hidden />
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded-full p-[3px] text-[15px] font-bold text-[var(--color-text)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-divider)_28%,transparent)] transition-[transform,box-shadow] duration-200 group-hover/ms-hl:-translate-y-0.5 group-hover/ms-hl:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
                      style={{
                        background:
                          "linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 42%, transparent), color-mix(in srgb, var(--color-primary-dark) 58%, #12121a))",
                      }}
                    >
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-bg-elevated)_88%,var(--color-primary)_12%)] text-[var(--color-text-secondary)] transition-colors group-hover/ms-hl:text-[var(--color-text)]">
                        {m.abbr}
                      </span>
                    </span>
                  </span>
                ) : (
                  <span
                    className="flex h-16 w-16 items-center justify-center rounded-full p-[3px] text-[15px] font-bold text-[var(--color-text)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-divider)_28%,transparent)] transition-[transform,box-shadow] duration-200 group-hover/ms-hl:-translate-y-0.5 group-hover/ms-hl:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-primary)_38%,transparent)]"
                    style={{
                      background:
                        "linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 35%, transparent), color-mix(in srgb, var(--color-primary-dark) 55%, #12121a))",
                    }}
                  >
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-bg-elevated)_90%,transparent)] text-[var(--color-text-secondary)] transition-colors group-hover/ms-hl:text-[var(--color-text)]">
                      {m.abbr}
                    </span>
                  </span>
                )}
                <span className="line-clamp-2 w-full text-[13px] font-semibold leading-snug text-[var(--color-text-secondary)] group-hover/ms-hl:text-[var(--color-text)]">{m.label}</span>
              </Link>
            ))}
      </div>
    </section>
  );
}
