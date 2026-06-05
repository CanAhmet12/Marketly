"use client";

import Link from "next/link";
import { useState, memo, type ComponentType } from "react";
import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { formatViews, type VRPulseItem } from "./discover-visual-reference-data";
import {
  ThumbPulse1, ThumbPulse2, ThumbPulse3,
  ThumbPulse4, ThumbPulse5, ThumbPulse6,
  ThumbGeneric,
} from "./vr-thumbnails";

export type PulseTier = "featured" | "standard" | "tall";
export type PulseVariant = "default" | "trending" | "breaking";

/* ─── Thumbnail selector ─────────────────────────────────────────────────── */
const PULSE_THUMBS: Record<string, ComponentType> = {
  "pulse-1": ThumbPulse1,
  "pulse-2": ThumbPulse2,
  "pulse-3": ThumbPulse3,
  "pulse-4": ThumbPulse4,
  "pulse-5": ThumbPulse5,
  "pulse-6": ThumbPulse6,
};

function PulseThumb({ item }: { item: VRPulseItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const Thumb = PULSE_THUMBS[item.id] ?? ThumbGeneric;
  const gid = item.id.replace(/[^a-z0-9-]/gi, "");
  const url = item.thumb?.trim() ?? "";
  const remote = url.startsWith("http://") || url.startsWith("https://");
  const showPhoto = url.length > 0 && !imgFailed;

  return (
    <div className="dvr-pulse-thumb-well absolute inset-0 overflow-hidden">
      {showPhoto ? (
        <>
          {remote ? (
            <RemoteCoverImage
              src={url}
              className="absolute inset-0 z-0"
              sizes="(max-width: 640px) 45vw, 240px"
              onFailed={() => setImgFailed(true)}
            />
          ) : (
            <img
              src={url}
              alt=""
              className="absolute inset-0 z-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          )}
        </>
      ) : (
        <div className="dvr-pulse-thumb-chart pointer-events-none absolute inset-0 z-0 [&_svg]:opacity-[0.28]">
          <Thumb />
        </div>
      )}
      <div className="dvr-pulse-media-veil pointer-events-none absolute inset-0 z-1" aria-hidden />
      {!showPhoto ? (
        <div className="dvr-pulse-studio-sil pointer-events-none absolute bottom-8 right-0 z-3 w-[38%] max-w-[92px]" aria-hidden>
          <svg className="h-full w-full text-white/14" viewBox="0 0 64 88" fill="currentColor">
            <defs>
              <linearGradient id={`ps-${gid}`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <ellipse cx="40" cy="28" rx="14" ry="16" fill={`url(#ps-${gid})`} />
            <rect x="18" y="44" width="36" height="22" rx="4" fill="rgba(255,255,255,0.06)" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

/* ─── Pulse card ─────────────────────────────────────────────────────────── */
function DiscoverPulseCardInner({
  item,
  tier = "standard",
  index = 0,
  variant = "default",
  density = "rail",
  topicTile = false,
}: {
  item: VRPulseItem;
  tier?: PulseTier;
  index?: number;
  variant?: PulseVariant;
  /** topic kümesi: daha sıkı, video hissi */
  density?: "rail" | "topic";
  /** Topic 3×2 grid: 16:9 thumb, meta dışarıda yok */
  topicTile?: boolean;
}) {
  const isTall = tier === "tall";
  const isFeatured = tier === "featured";

  const thumbClass = topicTile
    ? "dvr-pulse-thumb--topic-tile aspect-video w-full"
    : isTall
      ? "dvr-pulse-thumb--tall"
      : isFeatured
        ? "dvr-pulse-thumb--featured"
        : "dvr-pulse-thumb--standard";

  return (
    <article
      className={cn(
        "dvr-pulse-card group flex flex-col",
        isFeatured && "dvr-pulse-card--featured",
        isTall && "dvr-pulse-card--tall",
        variant === "trending" && "dvr-pulse-card--trending",
        variant === "breaking" && "dvr-pulse-card--breaking",
        density === "topic" && "dvr-pulse-card--topic-density",
        topicTile && "dvr-pulse-card--topic-tile",
        "motion-entrance",
      )}
      style={motionEntranceDelay(index)}
    >
      {/* 9:16 thumbnail */}
      <Link
        href={item.href}
        className={cn("relative block overflow-hidden rounded-xl", thumbClass)}
        aria-label={item.title}
      >
        <PulseThumb item={item} />

        {item.avatarInitial && item.avatarColor ? (
          <span
            className="dvr-pulse-creator-avatar pointer-events-none absolute bottom-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-black/50"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${item.avatarColor}ee, ${item.avatarColor}88)`,
            }}
            aria-hidden
          >
            {item.avatarInitial}
          </span>
        ) : null}

        <span
          className={cn(
            "dvr-pulse-play-hint pointer-events-none absolute bottom-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white/95 ring-1 ring-white/28 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100",
            item.avatarInitial ? "left-10" : "left-2",
            "opacity-[0.82] group-hover:opacity-100",
          )}
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        {/* Bottom gradient for meta */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-linear-to-t from-black/58 via-black/10 to-transparent" />

        {/* Tag top-left */}
        <div className="absolute left-2 top-2 z-10 flex min-w-0 flex-1 flex-wrap items-center gap-1 pr-16">
          {variant === "breaking" ? (
            <span className="dvr-pulse-variant-badge dvr-pulse-variant-badge--breaking rounded px-1.5 py-[3px] text-[8px] font-bold uppercase tracking-wider">
              Kırılma
            </span>
          ) : null}
          {variant === "trending" ? (
            <span className="dvr-pulse-variant-badge dvr-pulse-variant-badge--trending rounded px-1.5 py-[3px] text-[8px] font-bold uppercase tracking-wider">
              Trend
            </span>
          ) : null}
          <span className="dvr-pulse-tag rounded px-1.5 py-[3px] text-[8.5px] font-bold uppercase tracking-wider text-white/78">
            {item.tag}
          </span>
          {item.formatLabel ? (
            <span className="dvr-pulse-format-pill rounded px-1.5 py-[3px] text-[7.5px] font-bold uppercase tracking-wide text-white/80">
              {item.formatLabel}
            </span>
          ) : null}
        </div>

        {/* Duration bottom-right */}
        <span className="dvr-duration-badge absolute bottom-2 right-2 z-10 rounded px-1.5 py-[3px] text-[9.5px] font-bold tabular-nums text-white/92">
          {item.durationLabel}
        </span>

        {/* Play on hover */}
        <div
          className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {topicTile ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[21] bg-linear-to-t from-black/72 via-black/22 to-transparent px-2.5 pb-2 pt-10">
            <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white/95">{item.title}</p>
            <p className="mt-0.5 truncate text-[9px] font-medium text-white/48">
              {item.creator} · {formatViews(item.views)}
            </p>
          </div>
        ) : null}
      </Link>

      {/* Meta */}
      {topicTile ? null : (
      <div className="mt-2 flex flex-col gap-[2px]">
        {item.hookLine ? (
          <p className="dvr-pulse-hook line-clamp-1 text-[9.5px] font-semibold leading-snug">
            “{item.hookLine}”
          </p>
        ) : null}
        <Link href={item.href} className="block">
          <p
            className={cn(
              "dvr-pulse-title line-clamp-2 font-semibold leading-[1.32] transition-opacity group-hover:opacity-70",
              isFeatured || isTall ? "text-[13px]" : "text-[11.5px]",
            )}
          >
            {item.title}
          </p>
        </Link>
        <p className={cn("dvr-pulse-meta truncate", isFeatured || isTall ? "text-[10.5px]" : "text-[10px]")}>
          {item.creator}
        </p>
        <p className={cn("dvr-pulse-views tabular-nums", isFeatured || isTall ? "text-[10.5px]" : "text-[9.5px]")}>
          {formatViews(item.views)} izlenme · {item.durationLabel}
        </p>
      </div>
      )}
    </article>
  );
}

export const DiscoverPulseCard = memo(DiscoverPulseCardInner);
