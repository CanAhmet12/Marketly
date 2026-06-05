"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import type { VRCreatorItem } from "./discover-visual-reference-data";

/* ─── Live pulse indicator ───────────────────────────────────────────────── */
function LivePulse() {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/60 motion-reduce:animate-none" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
    </span>
  );
}

/* ─── Creator avatar with live ring ─────────────────────────────────────── */
function CreatorAvatar({ item, size = 44 }: { item: VRCreatorItem; size?: number }) {
  const ringCls = item.isLive
    ? "ring-2 ring-red-500/70"
    : "ring-1 ring-white/12";
  return (
    <div className="relative shrink-0">
      <span
        className={cn("flex items-center justify-center rounded-full font-bold text-white", ringCls)}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, ${item.avatarColor}ee, ${item.avatarColor}88)`,
          fontSize: size * 0.4,
        }}
        aria-hidden
      >
        {item.avatarInitial}
      </span>
      {item.isLive ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#080a0f] ring-1 ring-red-500/50">
          <span className="h-2 w-2 rounded-full bg-red-500" />
        </span>
      ) : null}
    </div>
  );
}

/* ─── Creator card — horizontal compact analyst tile ─────────────────────── */
export function DiscoverCreatorCard({ item, index = 0 }: { item: VRCreatorItem; index?: number }) {
  const [followed, setFollowed] = useState(false);

  return (
    <article
      className="dvr-creator-tile group relative z-0 flex min-w-0 flex-col overflow-hidden rounded-xl motion-entrance"
      style={motionEntranceDelay(index)}
    >
      {/* Subtle top gradient accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-40"
        style={{
          background: `linear-gradient(180deg, ${item.avatarColor}22 0%, transparent 100%)`,
        }}
        aria-hidden
      />

      <Link href={item.href} className="absolute inset-0 z-0" aria-label={item.displayName} />

      <div className="relative z-1 flex flex-col gap-3 p-4">
        {/* Top row — avatar + status + follow */}
        <div className="flex items-start justify-between gap-2">
          <CreatorAvatar item={item} size={46} />

          <div className="flex flex-col items-end gap-1.5">
            {item.isLive ? (
              <span className="dvr-creator-live-badge inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-widest text-red-300/90">
                <LivePulse />
                Canlı Yayında
              </span>
            ) : (
              <span className="dvr-creator-status-badge rounded px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider">
                {item.tag}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setFollowed((f) => !f); }}
              className={cn(
                "dvr-creator-follow-btn relative z-2 rounded-md px-3 py-1 text-[10px] font-bold tracking-wide transition-all",
                followed ? "dvr-creator-follow-btn--active" : "",
              )}
              aria-pressed={followed}
            >
              {followed ? "Takipte" : "Takip Et"}
            </button>
          </div>
        </div>

        {/* Creator identity */}
        <div className="min-w-0">
          <Link href={item.href} className="relative z-2 block">
            <p className="dvr-creator-name truncate">{item.displayName}</p>
            <p className="dvr-creator-handle truncate">{item.handle}</p>
          </Link>
        </div>

        {/* Specialty */}
        <p className="dvr-creator-specialty line-clamp-1">{item.specialty}</p>

        {/* Footer — formats + followers */}
        <div className="dvr-creator-tile__footer flex items-center justify-between gap-2 pt-2.5">
          <span className="dvr-creator-formats truncate text-[9.5px]">
            {item.contentFormats}
          </span>
          <span className="dvr-creator-followers shrink-0 tabular-nums text-[9.5px]">
            {item.followers}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ─── Ultra-compact inline creator row for stream interruption ───────────── */
export function DiscoverCreatorRow({ item, index = 0 }: { item: VRCreatorItem; index?: number }) {
  const [followed, setFollowed] = useState(false);

  return (
    <article
      className="dvr-creator-row group relative z-0 flex items-center gap-3 rounded-xl px-3.5 py-2.5 motion-entrance"
      style={motionEntranceDelay(index)}
    >
      <Link href={item.href} className="absolute inset-0 z-0" aria-label={item.displayName} />

      <CreatorAvatar item={item} size={36} />

      <div className="relative z-1 min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={item.href} className="dvr-creator-row__name relative z-2 truncate text-[12.5px] font-bold">
            {item.displayName}
          </Link>
          {item.isLive ? <LivePulse /> : null}
        </div>
        <p className="dvr-creator-row__specialty truncate text-[10px]">{item.specialty}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="dvr-creator-row__followers text-[9px] font-semibold tabular-nums">{item.followers}</p>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setFollowed((f) => !f); }}
          className={cn(
            "relative z-2 mt-1 rounded px-2.5 py-0.5 text-[9px] font-bold tracking-wide transition-all",
            followed ? "dvr-creator-row__follow--active" : "dvr-creator-follow-btn",
          )}
          aria-pressed={followed}
        >
          {followed ? "Takipte" : "Takip"}
        </button>
      </div>
    </article>
  );
}
