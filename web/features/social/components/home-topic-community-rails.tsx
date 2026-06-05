"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

export function HomeTopicCommunityRails({ embedded = false, maxItems }: { embedded?: boolean; maxItems?: number }) {
  const strip = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getHomeTopicCommunityStrip();
  }, []);

  if (!strip) return null;

  const ordered = [
    ...strip.trending_chips.slice(0, 5),
    ...strip.rising_chips.slice(0, 3),
    ...strip.creator_lane.slice(0, 2),
  ];
  const seen = new Set<string>();
  const chips = ordered.filter((c) => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });

  if (!chips.length) return null;

  const shown = maxItems != null ? chips.slice(0, maxItems) : chips;
  const listMode = Boolean(embedded && maxItems != null);

  return (
    <div className={embedded ? "pb-0" : "border-b border-[var(--color-divider)] pb-[var(--sp-2)]"}>
      {!listMode ? (
        <>
          <div className="mb-1.5 flex items-center gap-[var(--sp-2)]">
            <span className="text-[11px] font-semibold text-[var(--color-meta)]">Gündem</span>
            <Link href="/discover" className="ml-auto text-[10px] font-semibold text-[var(--color-primary-dark)] hover:underline">
              Keşfet
            </Link>
          </div>
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {shown.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={embedded
                  ? "inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[12px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                  : "inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)]/40"}
              >
                {c.label}
                {c.heatLabel ? (
                  <span className="text-[9px] font-medium text-[var(--color-meta)]">{c.heatLabel}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <ul className="m-0 mt-2 list-none space-y-1.5 p-0">
          {shown.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="block text-[13px] font-medium leading-snug text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                <span className="text-[var(--color-text)]">{c.label}</span>
                {c.heatLabel ? <span className="text-[12px] font-normal text-[var(--color-meta)]"> — {c.heatLabel}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
