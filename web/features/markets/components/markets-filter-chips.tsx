"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

import type { MarketAssetView, MarketLensId, MarketSegmentId } from "@/features/markets/types";
import { cn } from "@/lib/cn";

const SEGMENTS: { id: MarketSegmentId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "crypto", label: "Kripto" },
  { id: "stocks", label: "Hisseler" },
  { id: "forex", label: "Forex" },
  { id: "commodity", label: "Emtia" },
  { id: "index", label: "Endeks" },
  { id: "watchlist", label: "Takip listem" },
];

const LENSES: { id: MarketLensId; label: string }[] = [
  { id: "none", label: "Özet" },
  { id: "favorites", label: "Takiptekiler" },
  { id: "gainers", label: "Yükselenler" },
  { id: "losers", label: "Düşenler" },
  { id: "active", label: "Volatil" },
  { id: "volume", label: "Hacim" },
  { id: "volatile", label: "Genlik" },
  { id: "signals", label: "Sinyal" },
  { id: "watchlist", label: "Sabitler" },
];

type Props = {
  segment: MarketSegmentId;
  lens: MarketLensId;
  onSegment: (id: MarketSegmentId) => void;
  onLens: (id: MarketLensId) => void;
  segmentCounts: Record<MarketSegmentId, number>;
  segmentHint: string | null;
};

export function MarketsFilterControl({ segment, lens, onSegment, onLens, segmentCounts, segmentHint }: Props) {
  const segmentRefs = useRef<Partial<Record<MarketSegmentId, HTMLButtonElement | null>>>({});

  const onSegmentKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, current: MarketSegmentId) => {
      const order = SEGMENTS.map((s) => s.id);
      const idx = order.indexOf(current);
      if (idx < 0) return;
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % order.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + order.length) % order.length;
      else return;
      e.preventDefault();
      const next = order[nextIdx]!;
      segmentRefs.current[next]?.focus();
      onSegment(next);
    },
    [onSegment],
  );

  return (
    <div className="sticky top-0 z-20 -mx-[var(--sp-3)] min-[900px]:-mx-0">
      <div className="markets-glass-25 min-h-[132px] rounded-2xl px-[var(--sp-3)] py-[var(--sp-3)]">
        <p className="mb-[var(--sp-2)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-meta)]">Pazar</p>
        <div className="flex flex-wrap gap-x-[var(--sp-1)] gap-y-[var(--sp-2)]" role="tablist" aria-label="Pazar segmenti">
          {SEGMENTS.map((s) => {
            const on = segment === s.id;
            const c = segmentCounts[s.id] ?? 0;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  segmentRefs.current[s.id] = el;
                }}
                type="button"
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => onSegment(s.id)}
                onKeyDown={(e) => onSegmentKeyDown(e, s.id)}
                className={cn(
                  "markets-filter-chip shrink-0 rounded-full px-[var(--sp-3)] py-[var(--sp-2)] text-[11px] font-semibold transition-[color,box-shadow] sm:text-[12px]",
                  on
                    ? "text-[var(--color-text)] shadow-[inset_0_-2px_0_0_var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
                )}
              >
                {s.label}
                <span className="ml-1 tabular-nums text-[var(--color-meta)]">({c})</span>
              </button>
            );
          })}
        </div>

        {segmentHint ? (
          <p className="mt-[var(--sp-3)] text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]">{segmentHint}</p>
        ) : null}

        <p className="mb-[var(--sp-2)] mt-[var(--sp-4)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-meta)]">Liste</p>
        <div className="ms-scrollbar-thin ms-rail-scroll flex gap-[var(--sp-2)] overflow-x-auto pb-px" role="toolbar" aria-label="Liste filtresi">
          {LENSES.map((l) => {
            const on = lens === l.id;
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={on}
                onClick={() => onLens(l.id)}
                className={cn(
                  "markets-filter-chip shrink-0 rounded-full px-[var(--sp-3)] py-[var(--sp-2)] text-[12px] font-semibold transition-[color,box-shadow]",
                  on
                    ? "text-[var(--color-text)] shadow-[inset_0_-2px_0_0_var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
                )}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function trendingFromAssets(assets: MarketAssetView[], n = 5): MarketAssetView[] {
  return [...assets].sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)).slice(0, n);
}
