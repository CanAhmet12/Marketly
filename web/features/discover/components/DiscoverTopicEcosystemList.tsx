"use client";

import Link from "next/link";

import type { DiscoverTopicEcosystem } from "@/mock/adapters/discover-lower";

type Props = {
  topics: DiscoverTopicEcosystem[];
};

export function DiscoverTopicEcosystemList({ topics }: Props) {
  return (
    <ul className="discover-topic-eco m-0 flex list-none flex-col gap-2 p-0 sm:gap-2.5">
      {topics.map((t) => (
        <li key={t.id} className="min-w-0">
          <Link
            href={t.href}
            className="discover-topic-eco__row group flex min-w-0 flex-col gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--hv-sep)_65%,transparent)] bg-[color-mix(in_srgb,var(--hv-text)_3.5%,transparent)] px-[var(--hv-s-4)] py-[var(--hv-s-3)] transition-[border-color,background-color] hover:border-[color-mix(in_srgb,var(--hv-text)_14%,transparent)] hover:bg-[color-mix(in_srgb,var(--hv-text)_5.5%,transparent)] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[0.9375rem] font-semibold tracking-tight text-[var(--hv-text)] group-hover:text-[var(--hv-text-warm)]">{t.title}</span>
                <span className="text-[0.6875rem] font-medium tabular-nums text-[var(--hv-text-3)]">
                  {t.discussionCount.toLocaleString("tr-TR")} tartışma · {t.creatorCount} üretici
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-[var(--hv-text-2)]">{t.summary}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end sm:text-right">
              <span className="text-[0.6875rem] font-semibold text-[var(--hv-teal)]">{t.pulseLine}</span>
              <span className="text-[0.6875rem] font-semibold text-[var(--hv-text-3)] underline-offset-2 group-hover:text-[var(--hv-text-2)] group-hover:underline">
                Keşfet →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
