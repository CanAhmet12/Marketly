"use client";

import Link from "next/link";

import type { CreatorRoomSearchHit } from "@/features/search/types";

type Props = { room: CreatorRoomSearchHit };

export function SearchRoomHit({ room }: Props) {
  return (
    <Link
      href={room.href}
      className="sch-list-row block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--sp-3)] no-underline transition-shadow hover:shadow-[var(--shadow-card)]"
    >
      <div className="text-[14px] font-semibold text-[var(--color-text)]">{room.title}</div>
      <div className="mt-1 text-[13px] leading-snug text-[var(--color-text-secondary)]">{room.subtitle}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-meta)]">
        <span>{room.creator_name}</span>
        {room.premium_badge ? (
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-primary-dark)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
            Abone
          </span>
        ) : null}
      </div>
    </Link>
  );
}
