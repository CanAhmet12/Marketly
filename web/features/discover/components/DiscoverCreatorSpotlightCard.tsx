"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { DiscoverCreatorSpotlightRow } from "@/mock/adapters/discover-lower";
import { cn } from "@/lib/cn";

type Props = {
  row: DiscoverCreatorSpotlightRow;
  className?: string;
};

export function DiscoverCreatorSpotlightCard({ row, className }: Props) {
  return (
    <article
      className={cn(
        "discover-creator-spot group flex min-w-0 gap-3 rounded-lg border border-[color-mix(in_srgb,var(--hv-sep)_60%,transparent)] bg-[color-mix(in_srgb,var(--hv-text)_3%,transparent)] p-3 transition-[border-color,background-color] hover:border-[color-mix(in_srgb,var(--hv-text)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--hv-text)_5%,transparent)] sm:gap-3.5 sm:p-3.5",
        className,
      )}
    >
      <Link href={row.channelHref} className="shrink-0 self-start" tabIndex={-1}>
        {row.avatarUrl ? (
          <SafeAvatar
            src={row.avatarUrl}
            alt=""
            size={44}
            className="h-11 w-11 rounded-full ring-1 ring-[color-mix(in_srgb,var(--hv-text)_12%,transparent)]"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--hv-text)_8%,transparent)] text-[0.8125rem] font-bold text-[var(--hv-text)] ring-1 ring-[color-mix(in_srgb,var(--hv-text)_12%,transparent)]">
            {row.displayName.slice(0, 1).toUpperCase()}
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="rounded border border-[color-mix(in_srgb,var(--hv-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--hv-teal)_8%,transparent)] px-1.5 py-px text-[0.625rem] font-semibold uppercase tracking-wide text-[var(--hv-teal)]">
            {row.lensLabel}
          </span>
          <span className="text-[0.625rem] font-semibold text-[var(--hv-text-3)]">{row.activeFormatLabel}</span>
        </div>
        <Link href={row.channelHref} className="mt-1 block min-w-0">
          <p className="truncate text-[0.9375rem] font-semibold text-[var(--hv-text)] underline-offset-2 group-hover:underline">{row.displayName}</p>
          <p className="truncate text-[0.75rem] font-medium text-[var(--hv-text-3)]">{row.handle}</p>
        </Link>
        <p className="mt-1 line-clamp-1 text-[0.75rem] font-medium text-[var(--hv-text-2)]">{row.specialty}</p>
        <p className="mt-0.5 text-[0.6875rem] font-medium tabular-nums text-[var(--hv-text-3)]">{row.proofLabel}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center gap-2 self-stretch">
        <button
          type="button"
          className="rounded-md border border-[color-mix(in_srgb,var(--hv-text)_14%,transparent)] px-2.5 py-1 text-[0.6875rem] font-semibold text-[var(--hv-text-2)] transition-colors hover:border-[color-mix(in_srgb,var(--hv-teal)_40%,transparent)] hover:text-[var(--hv-text)]"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          Takip
        </button>
      </div>
    </article>
  );
}
