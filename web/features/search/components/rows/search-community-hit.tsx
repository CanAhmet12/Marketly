"use client";

import Link from "next/link";

import type { CommunitySearchHit } from "@/features/search/types";

type Props = { community: CommunitySearchHit };

export function SearchCommunityHit({ community }: Props) {
  return (
    <Link
      href={community.href}
      className="sch-list-row block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--sp-3)] no-underline transition-shadow hover:shadow-[var(--shadow-card)]"
    >
      <div className="text-[14px] font-semibold text-[var(--color-text)]">{community.title}</div>
      <div className="mt-1 text-[13px] leading-snug text-[var(--color-text-secondary)]">{community.subtitle}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-meta)]">
        <span>{community.heat_label}</span>
        <span>·</span>
        <span>{community.sentiment_label}</span>
        {community.linked_symbols.length > 0 ? (
          <span className="font-mono text-[10px]">{community.linked_symbols.slice(0, 3).join(" · ")}</span>
        ) : null}
      </div>
    </Link>
  );
}
