"use client";

import Link from "next/link";

import { isSignalEconomyLocked, signalAccessLabel } from "@/features/signals/domain/signal-economy";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { cn } from "@/lib/cn";

export function SignalEconomyChipsRow({ row, dense, className }: { row: SignalsFeedRow; dense?: boolean; className?: string }) {
  if (row.signal_access === "public" && !row.signal_package_label) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", dense ? "gap-1" : "gap-1.5", className)}>
      {row.signal_access !== "public" ? (
        <span className="max-w-full truncate rounded-md border border-[color-mix(in_srgb,var(--color-primary)_28%,var(--ms-border-hairline))] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-1.5 py-px text-[11px] font-semibold text-[var(--color-primary-dark)]">
          {signalAccessLabel(row.signal_access)}
        </span>
      ) : null}
      {row.analyst.tier && row.analyst.tier !== "free" ? (
        <span className="rounded-md border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-1.5 py-px text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          {row.analyst.tier}
        </span>
      ) : null}
      {row.analyst.verified ? (
        <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-1.5 py-px text-[11px] font-semibold text-[var(--color-meta)]">
          Profesyonel
        </span>
      ) : null}
      {row.signal_package_label ? (
        <span className="max-w-[min(100%,12rem)] truncate rounded-md border border-[var(--ms-border-hairline)] px-1.5 py-px text-[11px] font-semibold text-[var(--color-text-secondary)]">{row.signal_package_label}</span>
      ) : null}
    </div>
  );
}

export function SignalPremiumUnlockCta({
  channelId,
  compact,
  className,
}: {
  channelId: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Link
        href={`/channel/${channelId}`}
        className="inline-flex items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-primary)_35%,var(--ms-border-hairline))] bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-primary-dark)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_11%,transparent)]"
      >
        Üreticiye git
      </Link>
      <Link
        href={`/subscriptions/${encodeURIComponent(channelId)}`}
        className="inline-flex items-center justify-center rounded-full bg-[var(--color-text)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-surface)] transition hover:opacity-90"
      >
        {compact ? "Abonelik" : "Abonelik planları"}
      </Link>
    </div>
  );
}

export function signalRowLocked(row: SignalsFeedRow, isSubscriber: boolean): boolean {
  return isSignalEconomyLocked(row.signal_access, isSubscriber);
}
