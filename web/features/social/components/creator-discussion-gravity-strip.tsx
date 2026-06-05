"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

type Props = {
  highlightCreatorId?: string | null;
};

/** Üretici tartışma momentumu — global sıra + vurgu (SocialRepository). */
export function CreatorDiscussionGravityStrip({ highlightCreatorId }: Props) {
  const rows = useMemo(() => {
    if (!isMockDataEnabled()) return [];
    return getSocialRepository().getCreatorDiscussionGravity(8);
  }, []);

  if (!rows.length) return null;

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Tartışma liderliği</p>
      <ul className="mt-2 m-0 list-none space-y-1.5 p-0">
        {rows.map((r, i) => {
          const hi = highlightCreatorId && r.creator_id === highlightCreatorId;
          return (
            <li key={r.creator_id}>
              <Link
                href={r.href}
                className={cn(
                  "flex flex-wrap items-baseline justify-between gap-2 rounded-md px-1 py-1 text-[12px] hover:bg-[var(--color-surface-hover)]",
                  hi ? "bg-[var(--color-primary-light)]/50" : "",
                )}
              >
                <span className="font-semibold text-[var(--color-text)]">
                  <span className="tabular-nums text-[var(--color-meta)]">{i + 1}. </span>
                  {r.name}
                  <span className="ml-1 text-[11px] font-medium text-[var(--color-text-secondary)]">{r.handle}</span>
                </span>
                <span className="text-[10px] font-medium text-[var(--color-meta)]">
                  {r.heat_label}
                  {r.premium_badge ? <span className="ml-1 text-[var(--color-primary-dark)]">· pro</span> : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
