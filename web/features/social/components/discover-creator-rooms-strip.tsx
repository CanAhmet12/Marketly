"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { trackRoomOpen } from "@/features/personalization/tracking";
import { isMockDataEnabled } from "@/mock/config";

/** Keşfet — üretici oda vitrini (repository). */
export function DiscoverCreatorRoomsStrip() {
  const rail = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getDiscoverCreatorRoomsRail();
  }, []);

  if (!rail?.spotlight.length) return null;

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_1.5%,var(--color-surface))] p-3 shadow-[var(--shadow-card)] sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Üretici odaları</p>
          <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-[var(--color-text-secondary)]">{rail.headline}</p>
        </div>
        <Link href="/discover?tab=creators" className="shrink-0 text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline">
          Üreticiler
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {rail.collaboration_chips.map((c) => (
          <Link
            key={c.id}
            href={c.href}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]/35"
          >
            {c.label}
          </Link>
        ))}
      </div>
      <ul className="m-0 mt-3 grid list-none gap-2 p-0 min-[520px]:grid-cols-2">
        {rail.spotlight.slice(0, 6).map((s) => (
          <li key={s.room_id}>
            <Link
              href={s.href}
              onClick={() => trackRoomOpen(s.room_id, "discover_creator_rooms")}
              className="block rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-surface)] px-[var(--sp-2)] py-[var(--sp-2)] transition hover:border-[var(--color-primary)]/30"
            >
              <p className="line-clamp-1 text-[12px] font-bold text-[var(--color-text)]">{s.room_label}</p>
              <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">{s.creator_name}</p>
              <p className="mt-1 text-[10px] text-[var(--color-meta)]">{s.heat_label}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
