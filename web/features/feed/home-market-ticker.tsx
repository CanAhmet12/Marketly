"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getHomeRepository } from "@/features/home/repository";

/**
 * Phase 1A — compact cinematic ticker (repository read only).
 */
export function HomeMarketTicker() {
  const items = useMemo(() => getHomeRepository().getMarketPulse(), []);
  const loop = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className="relative overflow-hidden border-b border-[color-mix(in_srgb,var(--color-divider)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-elevated)_55%,transparent)] py-1.5"
      aria-label="Piyasa kısayolları"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)] to-transparent sm:w-10" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-[var(--color-bg)] via-[var(--color-bg)] to-transparent sm:w-10" aria-hidden />
      <div className="flex items-center gap-1.5 px-0.5 pb-0.5">
        <span className="inline-flex h-1 w-1 shrink-0 rounded-full bg-[var(--color-primary)] opacity-85 shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]" aria-hidden />
        <span className="text-[11px] font-semibold tracking-wide text-[var(--color-meta)]">Canlı semboller</span>
      </div>
      <div className="overflow-hidden">
        <div className="ms-home-ticker-track">
          {loop.map((x, i) => (
            <Link
              key={`${x.label}-${i}`}
              href={x.href}
              className="shrink-0 rounded-md px-2 py-1 text-[12px] font-semibold tracking-tight text-[var(--color-text-secondary)] outline-none transition-[color,background-color,transform] duration-[var(--motion-fast)] hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] hover:text-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] active:scale-[0.98]"
            >
              {x.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
