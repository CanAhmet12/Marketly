"use client";

import Link from "next/link";
import { useState, memo, type ComponentType } from "react";
import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { formatViewers, type VRLiveItem } from "./discover-visual-reference-data";
import {
  ThumbLive1, ThumbLive2, ThumbLive3,
  ThumbLive4, ThumbLive5, ThumbLive6,
  ThumbGeneric,
} from "./vr-thumbnails";

function LiveBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "gap-1 px-1.5 py-[3px] text-[8px]" : "gap-1.5 px-2 py-[3px] text-[9px]";
  const dotCls = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span className={cn("dvr-live-badge inline-flex items-center rounded font-bold uppercase tracking-wider text-white", cls)}>
      <span className={cn("relative flex shrink-0", dotCls)}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/40 motion-reduce:animate-none" />
        <span className={cn("relative inline-flex rounded-full bg-red-50", dotCls)} />
      </span>
      Canlı
    </span>
  );
}

function ViewerBadge({ count }: { count: number }) {
  return (
    <span className="dvr-viewer-badge dvr-viewer-badge--live inline-flex items-center gap-1 rounded font-semibold tabular-nums text-white/92">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {formatViewers(count)}
    </span>
  );
}

function AvatarFallback({
  initial,
  color,
  size,
  liveRing,
}: {
  initial: string;
  color: string;
  size: number;
  liveRing?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        liveRing
          ? "dvr-live-avatar-ring ring-2 ring-red-500/55 ring-offset-2 ring-offset-black/50"
          : "ring-1 ring-white/18",
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}88)`,
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

const LIVE_THUMBS: Record<string, ComponentType> = {
  "live-1": ThumbLive1,
  "live-2": ThumbLive2,
  "live-3": ThumbLive3,
  "live-4": ThumbLive4,
  "live-5": ThumbLive5,
  "live-6": ThumbLive6,
};

/** Home / LiveCard ile aynı: `thumb` URL + `onError` → SVG sahne yedeği. */
function LiveThumbLayer({ item, variant = "rail" }: { item: VRLiveItem; variant?: "rail" | "compact" }) {
  const [imgFailed, setImgFailed] = useState(false);
  const rail = variant === "rail";
  const url = item.thumb?.trim() ?? "";
  const remote = url.startsWith("http://") || url.startsWith("https://");
  const showPhoto = url.length > 0 && !imgFailed;
  const ThumbSvg = LIVE_THUMBS[item.id] ?? ThumbGeneric;

  return (
    <div className="dvr-live-thumb-well absolute inset-0 overflow-hidden">
      {showPhoto ? (
        <>
          {remote ? (
            <RemoteCoverImage
              src={url}
              className="absolute inset-0 z-0"
              sizes="(max-width: 640px) 50vw, 280px"
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
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-0",
            rail ? "dvr-live-thumb--rail" : "dvr-live-thumb--compact",
          )}
        >
          <ThumbSvg />
        </div>
      )}
      {rail && !showPhoto ? (
        <div className="dvr-live-thumb-grain pointer-events-none absolute inset-0 z-[1]" aria-hidden />
      ) : null}
      {!showPhoto ? (
        <div className="dvr-live-thumb-vignette pointer-events-none absolute inset-0 z-[2]" aria-hidden />
      ) : null}
    </div>
  );
}

const playRailCls = cn(
  "dvr-live-play-fab dvr-live-play-fab--rail dvr-live-play-anchor z-20",
  "flex h-[52px] w-[52px] items-center justify-center rounded-full",
  "opacity-0 transition-opacity duration-200 motion-reduce:transition-none",
  "group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100",
);

const playCompactCls = cn(
  "dvr-live-play-fab dvr-live-play-fab--compact dvr-live-play-anchor--compact z-20",
  "absolute flex h-9 w-9 items-center justify-center rounded-full",
  "opacity-0 transition-opacity duration-200 motion-reduce:transition-none",
  "group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100",
);

function DiscoverLiveCardInner({
  item,
  index = 0,
  urgencyLead = false,
}: {
  item: VRLiveItem;
  index?: number;
  urgencyLead?: boolean;
}) {
  const hostLiveRing = item.heat === "high" || (item.chatPerMin != null && item.chatPerMin >= 50);

  return (
    <article
      className={cn(
        "dvr-live-card dvr-live-card--rail group relative flex w-full flex-col overflow-hidden rounded-2xl",
        item.heat === "high" && "dvr-live-card--heat",
        urgencyLead && "dvr-live-card--urgency-lead",
        "motion-entrance",
      )}
      style={motionEntranceDelay(index)}
    >
      <div className="dvr-live-media dvr-live-media--rail relative w-full overflow-hidden rounded-2xl">
        <LiveThumbLayer item={item} variant="rail" />
        <div className="dvr-live-broadcast-veil pointer-events-none absolute inset-0 z-1" aria-hidden />
        {item.heat === "high" ? (
          <div className="dvr-live-heat-glow pointer-events-none absolute inset-0 z-1 rounded-2xl" aria-hidden />
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] dvr-live-read-grad" aria-hidden />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 px-3.5 pt-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <LiveBadge size="sm" />
            <span className="dvr-live-tag-min">{item.tag}</span>
          </div>
          <ViewerBadge count={item.viewers} />
        </div>

        <Link href={item.href} className={playRailCls} aria-label="İzle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-0.5" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </Link>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 px-3.5 pb-3.5 pt-11">
          <Link href={item.href} className="dvr-live-title-link block">
            <h3 className="dvr-live-title dvr-live-title--hero line-clamp-2 text-white">{item.title}</h3>
          </Link>
          <div className="dvr-live-meta-row mt-2 flex min-w-0 items-center gap-2.5 pr-1">
            <AvatarFallback initial={item.avatarInitial} color={item.avatarColor} size={36} liveRing={hostLiveRing} />
            <p className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-snug text-white/88">
              {item.creator}
              <span className="font-medium text-white/42"> · </span>
              <span className="tabular-nums text-white/52">{formatViewers(item.viewers)} izleyici</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export const DiscoverLiveCard = memo(DiscoverLiveCardInner);

function DiscoverLiveCardCompactInner({
  item,
  index = 0,
  topicTile = false,
}: {
  item: VRLiveItem;
  index?: number;
  /** Topic 3×2 grid: alt footer yok, sadece medya + overlay */
  topicTile?: boolean;
}) {
  const hostLiveRing = item.heat === "high" || (item.chatPerMin != null && item.chatPerMin >= 50);

  return (
    <article
      className={cn(
        "dvr-live-card dvr-live-card--compact group relative flex w-full flex-col overflow-hidden rounded-xl",
        topicTile && "dvr-live-card--topic-tile",
        "motion-entrance",
      )}
      style={motionEntranceDelay(index)}
    >
      <div className="dvr-live-media dvr-live-media--compact relative w-full overflow-hidden rounded-xl">
        <LiveThumbLayer item={item} variant="compact" />
        <div className="dvr-live-broadcast-veil pointer-events-none absolute inset-0 z-1" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[46%] bg-linear-to-t from-black/68 via-black/14 to-transparent" />

        <div className="absolute left-2.5 top-2.5 z-10">
          <LiveBadge size="sm" />
        </div>
        <div className="absolute right-2.5 top-2.5 z-10">
          <ViewerBadge count={item.viewers} />
        </div>
        <span className="absolute left-2.5 top-11 z-10 rounded bg-black/45 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-white/65">
          {item.tag}
        </span>

        <Link href={item.href} className={playCompactCls} aria-label="İzle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-px" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </Link>

        <div className="absolute inset-x-0 bottom-0 z-10 px-2.5 pb-2.5">
          <Link href={item.href} className="dvr-live-title-link block">
            <p className="dvr-live-title dvr-live-title--compact line-clamp-2 text-white">{item.title}</p>
          </Link>
        </div>
      </div>

      {topicTile ? null : (
      <div className="dvr-live-card__footer dvr-live-card__footer--slim flex items-center gap-2 px-2.5 py-2">
        <AvatarFallback initial={item.avatarInitial} color={item.avatarColor} size={22} liveRing={hostLiveRing} />
        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-white/85">{item.creator}</p>
      </div>
      )}
    </article>
  );
}

export const DiscoverLiveCardCompact = memo(DiscoverLiveCardCompactInner);
