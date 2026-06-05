"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

/** Piyasalar — üretici oda köprüsü (repository). */
export function MarketsCreatorRoomsHint() {
  const rail = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getDiscoverCreatorRoomsRail();
  }, []);

  if (!rail?.spotlight[0]) return null;
  const s = rail.spotlight[0];

  return (
    <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-[var(--sp-3)] py-[var(--sp-2)]">
      <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Üretici oda köprüsü</p>
      <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">
        {s.creator_name} · {s.room_label}
      </p>
      <Link href={s.href} className="mt-1 inline-block text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
        Odaya git →
      </Link>
    </div>
  );
}
