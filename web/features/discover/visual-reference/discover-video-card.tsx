"use client";

import Link from "next/link";
import { useState, memo, type ComponentType } from "react";
import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { formatViews, type VRVideoItem } from "./discover-visual-reference-data";
import {
  ThumbVideo1, ThumbVideo2, ThumbVideo3,
  ThumbVideo4, ThumbVideo5, ThumbVideo6,
  ThumbGeneric,
} from "./vr-thumbnails";

function AvatarFallback({ initial, color, size }: { initial: string; color: string; size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-1 ring-white/12"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}88)`,
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

/* ─── Thumbnail selector ─────────────────────────────────────────────────── */
const VIDEO_THUMBS: Record<string, ComponentType> = {
  "vid-1": ThumbVideo1,
  "vid-2": ThumbVideo2,
  "vid-3": ThumbVideo3,
  "vid-4": ThumbVideo4,
  "vid-5": ThumbVideo5,
  "vid-6": ThumbVideo6,
};

function VideoThumb({ item, prestige }: { item: VRVideoItem; prestige?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const Thumb = VIDEO_THUMBS[item.id] ?? ThumbGeneric;
  const url = item.thumb?.trim() ?? "";
  const remote = url.startsWith("http://") || url.startsWith("https://");
  const showPhoto = url.length > 0 && !imgFailed;

  return (
    <div className="dvr-video-thumb-well absolute inset-0 overflow-hidden">
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
            prestige && "dvr-video-thumb-chart [&_svg]:opacity-[0.34]",
          )}
        >
          <Thumb />
        </div>
      )}
      {showPhoto ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-1 h-5 bg-linear-to-b from-black/14 to-transparent" />
      ) : (
        <div className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(0,0,0,0.2)_100%)]" />
      )}
    </div>
  );
}

function DiscoverVideoCardInner({
  item,
  index = 0,
  prestige = false,
  topicTile = false,
}: {
  item: VRVideoItem;
  index?: number;
  prestige?: boolean;
  /** Topic 3×2 grid: meta dışarıda yok, başlık thumb içi overlay */
  topicTile?: boolean;
}) {
  return (
    <article
      className={cn(
        "dvr-video-card group flex min-w-0 flex-col motion-entrance",
        prestige && "dvr-video-card--prestige",
        topicTile && "dvr-video-card--topic-tile",
      )}
      style={motionEntranceDelay(index)}
    >
      {/* 16:9 thumbnail */}
      <Link
        href={item.href}
        className="dvr-video-thumb relative block aspect-video w-full overflow-hidden rounded-xl"
        aria-label={item.title}
      >
        <VideoThumb item={item} prestige={prestige} />
        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-linear-to-t from-black/52 via-black/10 to-transparent" />

        {/* Tag — standart kartlarda */}
        {!prestige ? (
          <span className="dvr-video-tag absolute left-2 top-2 z-10 rounded px-1.5 py-[3px] text-[8.5px] font-bold uppercase tracking-wider text-white/82">
            {item.tag}
          </span>
        ) : item.seriesTitle ? (
          <span className="dvr-video-series-eyebrow pointer-events-none absolute left-2 top-2 z-10 max-w-[min(92%,14rem)] truncate rounded px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/72">
            {item.seriesTitle}
          </span>
        ) : null}

        {/* Duration */}
        <span className="dvr-duration-badge absolute bottom-2 right-2 z-10 rounded px-1.5 py-[3px] text-[9.5px] font-bold tabular-nums text-white/92">
          {item.durationLabel}
        </span>

        {/* Play hover */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/18 backdrop-blur-sm ring-1 ring-white/28">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {topicTile ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] bg-linear-to-t from-black/72 via-black/18 to-transparent px-2.5 pb-2 pt-10">
            <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white/95">{item.title}</p>
            <p className="mt-0.5 truncate text-[9px] font-medium text-white/48">{item.creator}</p>
          </div>
        ) : null}
      </Link>

      {/* Meta */}
      {topicTile ? null : (
      <div className="mt-3 flex min-w-0 gap-2.5">
        <AvatarFallback initial={item.avatarInitial} color={item.avatarColor} size={32} />
        <div className="min-w-0 flex-1">
          {prestige && item.episodeLabel ? (
            <p className="dvr-video-episode-label mb-0.5 truncate text-[9.5px] font-semibold uppercase tracking-wide text-teal-300/70">
              {item.episodeLabel}
            </p>
          ) : null}
          <Link href={item.href} className="block">
            <p
              className={cn(
                "dvr-video-title line-clamp-2 leading-[1.32] transition-opacity group-hover:opacity-72",
                prestige && "dvr-video-title--prestige",
              )}
            >
              {item.title}
            </p>
          </Link>
          <p className={cn("dvr-video-meta mt-0.5 truncate", prestige && "dvr-video-meta--prestige")}>{item.creator}</p>
          <p className={cn("dvr-video-stats mt-0.5 tabular-nums", prestige && "dvr-video-stats--prestige")}>
            {formatViews(item.views)} görüntüleme · {item.publishedAgo}
          </p>
        </div>
      </div>
      )}
    </article>
  );
}

export const DiscoverVideoCard = memo(DiscoverVideoCardInner);
