"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

type Props = { signalId: string | null | undefined };

export function SignalCreatorRoomLinkStrip({ signalId }: Props) {
  const link = useMemo(() => {
    if (!isMockDataEnabled() || !signalId) return null;
    return getSocialRepository().getSignalCreatorRoomLink(signalId);
  }, [signalId]);

  if (!link) return null;

  return (
    <div className="mt-[var(--sp-3)] rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-primary)_18%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-primary)_5%,var(--color-surface))] px-[var(--sp-3)] py-[var(--sp-2)]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Üretici odası</p>
      <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">{link.label}</p>
      <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{link.sub}</p>
      <Link href={link.href} className="mt-2 inline-block text-[12px] font-bold text-[var(--color-primary-dark)] hover:underline">
        Odaya git →
      </Link>
    </div>
  );
}
