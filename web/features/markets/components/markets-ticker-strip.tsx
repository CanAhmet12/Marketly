"use client";

import Link from "next/link";

import type { MarketAssetView } from "@/features/markets/types";
import { trendingFromAssets } from "@/features/markets/components/markets-filter-chips";
import { parseVolumeRough } from "@/features/markets/lib/filter-assets";
import { changePercentTextClass, formatSignedChangePercent } from "@/features/markets/lib/market-display";
import { cn } from "@/lib/cn";

type Props = { assets: MarketAssetView[] };

/** Mobil LiveTicker + VolumeLeaders hibriti — üst şerit */
export function MarketsTickerStrip({ assets }: Props) {
  const byVol = [...assets].sort((a, b) => parseVolumeRough(b.volume) - parseVolumeRough(a.volume)).slice(0, 6);
  const hot = trendingFromAssets(assets, 5);

  return (
    <div className="space-y-[var(--sp-2)]">
      <div className="flex flex-wrap items-center gap-[var(--sp-2)] text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">
        <span className="text-[var(--color-text)]">Canlı şerit</span>
        <span className="text-[var(--color-border)]">·</span>
        <span>Hacim + volatilite</span>
      </div>
      <div className="ms-scrollbar-thin flex gap-[var(--sp-4)] overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-2)]">
        {byVol.map((a) => {
          return (
            <Link
              key={`v-${a.id}`}
              href={`/markets/${encodeURIComponent(a.symbol)}`}
              className="flex shrink-0 items-center gap-2 rounded-lg px-[var(--sp-2)] py-1 transition hover:bg-[var(--color-surface-hover)]"
            >
              <span className="text-[12px] font-bold text-[var(--color-text)]">{a.symbol}</span>
              <span className={cn("markets-mono text-[12px] font-semibold tabular-nums", changePercentTextClass(a.change_percent))}>
                {formatSignedChangePercent(a.change_percent)}
              </span>
            </Link>
          );
        })}
        <span className="self-center text-[var(--color-border)]">|</span>
        {hot.map((a) => (
          <Link
            key={`h-${a.id}`}
            href={`/markets/${encodeURIComponent(a.symbol)}`}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-[var(--sp-2)] py-1 text-[11px] font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)]"
          >
            <span className="text-[var(--color-text)]">{a.symbol}</span>
            <span className="text-[var(--color-meta)]">σ</span>
            <span className="markets-mono text-[var(--color-text)]">{Math.abs(a.change_percent).toFixed(1)}%</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
