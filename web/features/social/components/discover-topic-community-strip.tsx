"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

/** Keşfet — konu toplulukları + zekâ şeridi (repository). */
export function DiscoverTopicCommunityStrip() {
  const surface = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getDiscoverTopicCommunitySurface();
  }, []);

  if (!surface) return null;

  const has =
    surface.trending.length +
      surface.rising.length +
      surface.creatorHeavy.length +
      surface.fastestGrowing.length +
      surface.macroDebateTopics.length >
    0;
  if (!has) return null;

  const row = (title: string, items: typeof surface.trending) =>
    items.length ? (
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">{title}</p>
        <ul className="mt-1.5 m-0 flex flex-wrap gap-1.5 p-0">
          {items.slice(0, 8).map((t, i) => (
            <li key={`${title}-${t.slug}-${i}`}>
              <Link
                href={t.href}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]/35"
              >
                <span className="truncate">{t.label}</span>
                <span className="shrink-0 tabular-nums text-[10px] text-[var(--color-meta)]">{t.sentimentLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_1.5%,var(--color-surface))] p-3 shadow-[var(--shadow-card)] sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Konu toplulukları</p>
          <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-[var(--color-text-secondary)]">{surface.intelligenceHeadline}</p>
        </div>
        <Link href="/results?q=makro&tab=communities" className="shrink-0 text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline">
          Ara
        </Link>
      </div>
      {surface.premiumHints.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {surface.premiumHints.map((h) => (
            <Link
              key={h.id}
              href={h.href}
              className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_22%,var(--color-border))] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-surface-hover)]"
            >
              {h.text}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="mt-3 grid gap-3 min-[720px]:grid-cols-2 min-[1100px]:grid-cols-4">
        {row("Trend", surface.trending)}
        {row("Yükselen", surface.rising)}
        {row("Üretici ağırlıklı", surface.creatorHeavy)}
        {row("Makro masa", surface.macroDebateTopics)}
      </div>
    </section>
  );
}
