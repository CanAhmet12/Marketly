"use client";

import Link from "next/link";
import { changePercentTextClass, formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { WatchlistMarketsContext } from "@/features/markets/types/markets-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  hydrated: boolean;
  watchlistSize: number;
  context: WatchlistMarketsContext;
};

export function MarketsWatchlistSurface({ hydrated, watchlistSize, context }: Props) {
  if (!hydrated) {
    return (
      <section className="min-w-0 rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Takip listesi bağlamı</p>
        <p className="mt-2 text-[13px] font-medium text-[var(--color-text-secondary)]">Yükleniyor…</p>
      </section>
    );
  }

  if (watchlistSize === 0) {
    return null;
  }

  return (
    <section className="min-w-0 rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-[var(--sp-3)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Takip listesi bağlamı</p>
          <p className="mt-1 text-[13px] font-semibold text-[var(--color-text)]">
            {context.watchedCount} sembol · {context.pinnedCount} sabit · ort. hareket {context.avgAbsMovePct.toFixed(2)}%
          </p>
          <p className="mt-1 text-[12px] font-medium text-[var(--color-text-secondary)]">Takipteki varlıklarda {context.signalCountOnWatch} aktif sinyal (mock)</p>
          {context.watchlistDiscussionBridge ? (
            <p className="mt-2 text-[12px] font-semibold text-[var(--color-text-secondary)]">
              {context.watchlistDiscussionBridge.label}{" "}
              <Link href={context.watchlistDiscussionBridge.href} className="text-[var(--color-primary-dark)] hover:underline">
                {context.watchlistDiscussionBridge.symbol}
              </Link>
            </p>
          ) : null}
        </div>
        <Link href="/watchlist" className="shrink-0 text-[12px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Listeyi aç →
        </Link>
      </div>
      {context.movers.length > 0 ? (
        <ul className="mt-[var(--sp-3)] flex flex-wrap gap-[var(--sp-2)]">
          {context.movers.map((m) => (
            <li key={m.symbol}>
              <Link
                href={`/markets/${encodeURIComponent(m.symbol)}`}
                className="flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] px-[var(--sp-3)] py-1 text-[12px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]"
              >
                <span>{m.symbol}</span>
                <span className={cn("markets-mono tabular-nums", changePercentTextClass(m.change_percent))}>{formatSignedChangePercent(m.change_percent)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-[var(--sp-2)] text-[12px] text-[var(--color-meta)]">Takip sembolleri bu pazar kümesinde eşleşmedi.</p>
      )}
    </section>
  );
}
