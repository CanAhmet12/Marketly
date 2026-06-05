"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import type { VRSignalItem } from "./discover-visual-reference-data";

/* ─── Direction glyph ────────────────────────────────────────────────────── */
function DirGlyph({ direction }: { direction: VRSignalItem["direction"] }) {
  if (direction === "BUY") {
    return (
      <span className="dvr-sig-dir dvr-sig-dir--buy inline-flex items-center gap-1">
        <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
          <path d="M5 1 L9 9 L1 9 Z" />
        </svg>
        AL
      </span>
    );
  }
  if (direction === "SELL") {
    return (
      <span className="dvr-sig-dir dvr-sig-dir--sell inline-flex items-center gap-1">
        <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
          <path d="M5 9 L9 1 L1 1 Z" />
        </svg>
        SAT
      </span>
    );
  }
  return (
    <span className="dvr-sig-dir dvr-sig-dir--hold">
      — BEKLE
    </span>
  );
}

/* ─── Confidence bar ─────────────────────────────────────────────────────── */
function ConfBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const cls =
    pct >= 75 ? "bg-emerald-400" : pct >= 55 ? "bg-amber-400" : "bg-red-400/80";
  return (
    <div className="flex items-center gap-1.5">
      <div className="dvr-sig-conf-track h-[2px] flex-1 overflow-hidden rounded-full">
        <div className={cn("h-full rounded-full", cls)} style={{ width: `${pct}%` }} />
      </div>
      <span className="dvr-sig-conf tabular-nums">%{pct}</span>
    </div>
  );
}

/* ─── Signal stream row (tape style) ─────────────────────────────────────── */
export function DiscoverSignalTile({ item, index = 0 }: { item: VRSignalItem; index?: number }) {
  return (
    <article
      className="dvr-sig-tile group relative z-0 motion-entrance"
      style={motionEntranceDelay(index)}
    >
      <Link href={item.href} className="absolute inset-0 z-0" aria-label={`${item.symbol} sinyali`} />

      {/* Left accent bar */}
      <div
        className={cn(
          "dvr-sig-accent absolute left-0 top-0 h-full w-[3px]",
          item.direction === "BUY"  && "bg-emerald-500/70",
          item.direction === "SELL" && "bg-red-500/70",
          item.direction === "HOLD" && "bg-amber-500/50",
        )}
        aria-hidden
      />

      <div className="relative z-1 flex min-w-0 items-start gap-3 px-4 py-3">
        {/* Symbol + direction block */}
        <div className="min-w-[3.5rem] shrink-0">
          <p className="dvr-sig-symbol tabular-nums leading-none">{item.symbol}</p>
          <div className="mt-1">
            <DirGlyph direction={item.direction} />
          </div>
        </div>

        {/* Middle — rationale + levels */}
        <div className="min-w-0 flex-1">
          <p className="dvr-sig-rationale line-clamp-1">{item.rationale}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <span className="dvr-sig-level">
              <span className="dvr-sig-level-label">G </span>
            <span className="dvr-sig-level-value tabular-nums">{item.entry}</span>
            </span>
            <span className="dvr-sig-level">
              <span className="dvr-sig-level-label">H </span>
              <span className="text-emerald-400/85">{item.target}</span>
            </span>
            <span className="dvr-sig-level">
              <span className="dvr-sig-level-label">S </span>
              <span className="text-red-400/75">{item.stop}</span>
            </span>
            <span className="dvr-sig-tf">{item.timeframe}</span>
          </div>
          <div className="mt-1.5">
            <ConfBar value={item.confidence} />
          </div>
        </div>

        {/* Right — RR + analyst + age */}
        <div className="shrink-0 text-right">
          <div className="dvr-sig-rr-badge inline-block tabular-nums">R/R {item.rr}</div>
          <p className="dvr-sig-age tabular-nums">{item.age}</p>
          <p className="dvr-sig-analyst truncate">{item.analyst}</p>
        </div>
      </div>
    </article>
  );
}

/* ─── Ultra-light signal line (Tümü / topic tape) ─────────────────────────── */
export function DiscoverSignalFeedLine({
  item,
  index = 0,
  featured = false,
}: {
  item: VRSignalItem;
  index?: number;
  featured?: boolean;
}) {
  const arrow =
    item.direction === "BUY" ? "▲" : item.direction === "SELL" ? "▼" : "—";
  const dirCls =
    item.direction === "BUY"
      ? "text-emerald-400/85"
      : item.direction === "SELL"
        ? "text-red-400/85"
        : "text-amber-400/75";

  return (
    <Link
      href={item.href}
      className={cn("dvr-sig-feed-line group motion-entrance", featured && "dvr-sig-feed-line--featured")}
      style={motionEntranceDelay(index)}
    >
      <span className="dvr-sig-feed-line__sym tabular-nums">{item.symbol}</span>
      <span className={cn("dvr-sig-feed-line__dir font-bold tabular-nums", dirCls)}>{arrow}</span>
      <span className="dvr-sig-feed-line__name truncate">{item.assetName}</span>
      <span className="dvr-sig-feed-line__why min-w-0 flex-1 truncate">{item.rationale}</span>
      <span className="dvr-sig-feed-line__age shrink-0 tabular-nums">{item.age}</span>
    </Link>
  );
}

/* ─── Compact signal for stream interruptions ─────────────────────────────── */
export function DiscoverSignalCompact({ item, index = 0 }: { item: VRSignalItem; index?: number }) {
  return (
    <Link
      href={item.href}
      className="dvr-sig-compact group relative z-0 flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors motion-entrance"
      style={motionEntranceDelay(index)}
    >
      <div
        className={cn(
          "h-5 w-[2.5px] shrink-0 rounded-full",
          item.direction === "BUY"  && "bg-emerald-400/80",
          item.direction === "SELL" && "bg-red-400/80",
          item.direction === "HOLD" && "bg-amber-400/60",
        )}
        aria-hidden
      />
      <span className="dvr-sig-compact-symbol tabular-nums">{item.symbol}</span>
      <span className={cn(
        "dvr-sig-compact-dir text-[8.5px] font-bold uppercase tracking-widest",
        item.direction === "BUY"  && "text-emerald-400",
        item.direction === "SELL" && "text-red-400",
        item.direction === "HOLD" && "text-amber-400",
      )}>
        {item.direction === "BUY" ? "▲ AL" : item.direction === "SELL" ? "▼ SAT" : "— BEKLE"}
      </span>
      <span className="dvr-sig-compact-rationale min-w-0 flex-1 truncate">{item.rationale}</span>
      <span className="dvr-sig-compact-age shrink-0 tabular-nums">{item.age}</span>
    </Link>
  );
}
