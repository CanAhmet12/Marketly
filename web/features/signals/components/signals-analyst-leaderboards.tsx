"use client";

import Link from "next/link";

import { analystBadgeLabelTr } from "@/features/signals/intelligence/badge-labels";
import type { AnalystLeaderboardSection } from "@/features/signals/intelligence/types";
import { cn } from "@/lib/cn";

type Props = {
  sections: AnalystLeaderboardSection[];
  /** Keşfet vb. için daraltma */
  maxSections?: number;
  className?: string;
};

export function SignalsAnalystLeaderboards({ sections, maxSections = 12, className }: Props) {
  const list = sections.slice(0, maxSections);
  if (!list.length) return null;
  return (
    <div className={cn("space-y-[var(--sp-4)]", className)}>
      {list.map((sec) => (
        <section key={sec.id} className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--ms-border-hairline)] bg-[var(--ms-card-surface)] p-[var(--sp-3)] shadow-[var(--ms-shadow-1)]">
          <div className="mb-[var(--sp-2)] min-w-0 px-px">
            <h2 className="text-[13px] font-bold tracking-tight text-[var(--color-text)]">{sec.title}</h2>
            <p className="mt-0.5 text-[11px] font-medium leading-snug text-[var(--color-meta)]">{sec.subtitle}</p>
          </div>
          <div className="ms-rail-scroll -mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-0.5 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sec.rows.map((row) => (
              <Link
                key={`${sec.id}-${row.analystId}`}
                href={row.href}
                className="flex w-[min(78vw,240px)] shrink-0 flex-col rounded-xl border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--ms-card-surface))] px-[var(--sp-3)] py-[var(--sp-2)] transition hover:border-[color-mix(in_srgb,var(--color-primary)_28%,var(--ms-border-hairline))]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold tabular-nums text-[var(--color-meta)]">#{row.rank}</span>
                  {row.verified ? (
                    <span className="rounded bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-1 py-px text-[9px] font-bold text-[var(--color-primary-dark)]">Doğrulandı</span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-[13px] font-bold text-[var(--color-text)]">{row.display}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-[var(--color-meta)]">
                  {row.primaryMetricLabel}: <span className="tabular-nums text-[var(--color-text)]">{row.primaryMetricValue}</span>
                </p>
                {row.secondaryHint ? <p className="mt-0.5 truncate text-[10px] font-medium text-[var(--color-text-secondary)]">{row.secondaryHint}</p> : null}
                {row.badges.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {row.badges.map((b) => (
                      <span
                        key={b}
                        className="max-w-full truncate rounded-md border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-1.5 py-px text-[9px] font-semibold text-[var(--color-text-secondary)]"
                      >
                        {analystBadgeLabelTr(b)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
