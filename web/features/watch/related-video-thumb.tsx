"use client";

import { useCallback, useRef, useState } from "react";

import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import type { RelatedVideo } from "@/features/watch/types";
import { resolveThumbnailKind } from "@/lib/thumbnail-fallback";
import { pickMockOfflineThumbnail } from "@/mock/media/pick-mock-offline-thumbnail";

import { resolveRelatedVideoUrl, thumbForRelated } from "./watch-helpers";

type Props = { video: RelatedVideo };

function formatDuration(sec: number | null | undefined): string | null {
  if (!sec || sec <= 0) return null;
  if (sec >= 3600) {
    return `${Math.floor(sec / 3600)}:${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  }
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export function RelatedVideoThumb({ video }: Props) {
  const [hover, setHover] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewUrl = resolveRelatedVideoUrl(video);
  const thumb = thumbForRelated(video);
  const type = (video.type ?? "").toLowerCase();
  const isLive = type === "live";
  const isShort = type === "short" || type === "pulse";
  const videoish = type === "video" || isShort || isLive;
  const kind = resolveThumbnailKind(video.type, videoish, isLive, isShort);
  const fallbackSrc = pickMockOfflineThumbnail(`${video.id}|related|${kind}`);
  const thumbSrc = thumb ?? fallbackSrc;
  const remoteThumb = thumbSrc.startsWith("http://") || thumbSrc.startsWith("https://");
  const dur = formatDuration(video.duration);
  const canPreview = Boolean(previewUrl) && !isLive;

  const onEnter = useCallback(() => {
    setHover(true);
    const el = videoRef.current;
    if (!el || !canPreview) return;
    el.currentTime = 0;
    void el.play().catch(() => undefined);
  }, [canPreview]);

  const onLeave = useCallback(() => {
    setHover(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  return (
    <div
      className="relative h-[78px] w-[132px] max-w-[36%] shrink-0 overflow-hidden rounded-[10px] bg-[var(--color-thumb-bg)] sm:h-[84px] sm:w-[148px] sm:max-w-none"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {canPreview ? (
        <video
          ref={videoRef}
          src={previewUrl!}
          muted
          playsInline
          loop
          preload="none"
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${hover ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
      {remoteThumb ? (
        <RemoteCoverImage
          src={thumbSrc}
          sizes="148px"
          className={`transition duration-200 group-hover:scale-[1.03] ${hover && canPreview ? "opacity-0" : "opacity-100"}`}
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- mock/offline thumbnail */
        <img
          src={thumbSrc}
          alt=""
          className={`h-full w-full object-cover transition duration-200 group-hover:scale-[1.03] ${hover && canPreview ? "opacity-0" : "opacity-100"}`}
          loading="lazy"
        />
      )}
      {isLive ? (
        <span className="absolute left-1 top-1 z-[1] flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--color-danger)_88%,transparent)] px-1 py-px text-[8px] font-bold uppercase text-[var(--color-surface)]">
          <span className="h-1 w-1 animate-pulse rounded-full bg-[var(--color-surface)]" />
          LIVE
        </span>
      ) : isShort ? (
        <span className="absolute left-1 top-1 z-[1] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_82%,transparent)] px-1 py-px text-[8px] font-bold uppercase text-[var(--color-surface)]">
          Pulse
        </span>
      ) : null}
      {dur && !isLive ? (
        <span className="absolute bottom-1 right-1 z-[1] rounded bg-black/75 px-1 py-px text-[9px] font-bold tabular-nums text-white">{dur}</span>
      ) : null}
    </div>
  );
}
