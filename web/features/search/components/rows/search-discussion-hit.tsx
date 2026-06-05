"use client";

import Link from "next/link";

import type { DiscussionSearchHit } from "@/features/search/types";

type Props = { discussion: DiscussionSearchHit };

export function SearchDiscussionHit({ discussion }: Props) {
  return (
    <Link
      href={discussion.href}
      className="sch-list-row block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--sp-3)] no-underline transition-shadow hover:shadow-[var(--shadow-card)]"
    >
      <div className="text-[14px] font-semibold text-[var(--color-text)]">{discussion.title}</div>
      <div className="mt-1 text-[13px] leading-snug text-[var(--color-text-secondary)]">{discussion.snippet}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-meta)]">
        <span>{discussion.author_name}</span>
        <span>·</span>
        <span>{discussion.heat_label}</span>
        {discussion.asset_tag ? (
          <span className="font-semibold text-[var(--color-primary-dark)]">#{discussion.asset_tag}</span>
        ) : null}
      </div>
    </Link>
  );
}
