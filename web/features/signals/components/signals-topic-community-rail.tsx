"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

/** Sinyal pazarı — makro / yüksek tezlı konu rayı (repository). */
export function SignalsTopicCommunityRail() {
  const surface = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getDiscoverTopicCommunitySurface();
  }, []);

  if (!surface?.macroDebateTopics.length && !surface?.trending.length) return null;

  const chips = [...surface.macroDebateTopics.slice(0, 4), ...surface.trending.slice(0, 3)];
  const seen = new Set<string>();
  const unique = chips.filter((c) => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-[var(--sp-3)] py-[var(--sp-2)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Konu · sinyal köprüsü</p>
        <Link href="/discover" className="text-[10px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Keşfet →
        </Link>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {unique.map((c) => (
          <Link
            key={`sig-topic-${c.slug}`}
            href={c.href}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]/35"
          >
            {c.label}
            <span className="ml-1 text-[10px] text-[var(--color-meta)]">{c.heatLabel}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
