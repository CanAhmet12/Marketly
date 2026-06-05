"use client";

import Link from "next/link";
import { useMemo } from "react";

import type { DiscussionDiscoveryRow } from "@/features/social/repository/discussion-discovery-types";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

function Col({ title, rows, max }: { title: string; rows: DiscussionDiscoveryRow[]; max: number }) {
  if (!rows.length) return null;
  return (
    <div className="min-w-0 flex-1 sm:min-w-[180px]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{title}</p>
      <ul className="mt-1.5 m-0 list-none space-y-1.5 p-0">
        {rows.slice(0, max).map((r) => (
          <li key={r.id}>
            <Link href={r.href} className="block rounded-md px-1 py-0.5 hover:bg-[var(--color-surface-hover)]">
              <span className="line-clamp-2 text-[12px] font-semibold leading-snug text-[var(--color-text)]">{r.title}</span>
              <span className="mt-0.5 block text-[10px] font-medium text-[var(--color-text-secondary)]">{r.reason}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  /** Daha az sütun — sinyal / piyasa yan sütunları için */
  compact?: boolean;
};

/** Keşfet ve piyasa yüzeyleri — tartışma keşif yüzeyi (repository). */
export function DiscussionDiscoveryIntelPanel({ compact }: Props) {
  const surface = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getDiscussionDiscoverySurface();
  }, []);

  if (!surface) return null;

  const rowMax = compact ? 3 : 4;

  const cols = compact
    ? [
        ["Trend", surface.trending],
        ["Yükselen", surface.rising],
        ["Piyasa", surface.market_moving],
      ] as const
    : ([
        ["Trend", surface.trending],
        ["Yükselen", surface.rising],
        ["Üretici aktif", surface.creator_active],
        ["Münazara", surface.active_debates],
        ["Piyasa hareketi", surface.market_moving],
        ["Sinyal zinciri", surface.signal_linked_chain],
        ["Makro zincir", surface.macro_chains],
        ["Hızlı büyüyen", surface.fast_growing],
      ] as const);

  return (
    <section className="border-b border-[var(--color-divider)] pb-[var(--sp-3)]">
      <div className="mb-[var(--sp-2)] flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-[var(--color-meta)]">{surface.subline}</span>
        <Link href="/results?q=tartışma" className="shrink-0 text-[10px] font-semibold text-[var(--color-primary-dark)] hover:underline">
          Tümünü gör
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cols.map(([title, rows]) => (
          <Col key={title} title={title} rows={rows} max={rowMax} />
        ))}
      </div>
    </section>
  );
}
