"use client";

import Link from "next/link";
import { useState, memo, type ComponentType } from "react";
import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { getCardTagTone } from "./discover-card-tones";
import { formatViews, type VRVideoItem } from "./discover-visual-reference-data";
import {
  ThumbVideo1, ThumbVideo2, ThumbVideo3,
  ThumbVideo4, ThumbVideo5, ThumbVideo6,
  ThumbGeneric,
} from "./vr-thumbnails";

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
              className="dvr-video-thumb-photo absolute inset-0 z-0"
              sizes="(max-width: 640px) 72vw, 420px"
              onFailed={() => setImgFailed(true)}
            />
          ) : (
            <img
              src={url}
              alt=""
              className="dvr-video-thumb-photo absolute inset-0 z-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          )}
        </>
      ) : (
        <>
          <div
            className={cn(
              "dvr-video-thumb-chart pointer-events-none absolute inset-0 z-0",
              prestige && "[&_svg]:opacity-[0.34]",
            )}
            style={{
              background: `linear-gradient(145deg, ${item.gradientFrom} 0%, ${item.gradientTo} 100%)`,
            }}
          >
            <Thumb />
          </div>
          <div className="dvr-video-thumb-grain pointer-events-none absolute inset-0 z-1" aria-hidden />
          <div className="dvr-video-thumb-vignette pointer-events-none absolute inset-0 z-1" aria-hidden />
        </>
      )}
      <div className="dvr-video-media-glint pointer-events-none absolute inset-0 z-2" aria-hidden />
      <div className="dvr-video-media-veil pointer-events-none absolute inset-0 z-2" aria-hidden />
      <div className="dvr-video-media-scan pointer-events-none absolute inset-0 z-2" aria-hidden />
    </div>
  );
}

function DiscoverVideoCardInner({
  item,
  index = 0,
  prestige = false,
  topicTile = false,
  editorialLead = false,
  prestigeLead = false,
}: {
  item: VRVideoItem;
  index?: number;
  prestige?: boolean;
  topicTile?: boolean;
  editorialLead?: boolean;
  prestigeLead?: boolean;
}) {
  const hotViews = item.views >= 30000;
  const tagTone = getCardTagTone(item.tag);
  const useOverlayLayout = !topicTile;

  return (
    <article
      className={cn(
        "dvr-video-card dvr-video-card--premium group flex min-w-0 flex-col motion-entrance",
        `dvr-video-card--tone-${tagTone}`,
        prestige && "dvr-video-card--prestige",
        topicTile && "dvr-video-card--topic-tile",
        useOverlayLayout && "dvr-video-card--overlay-v2",
        editorialLead && "dvr-video-card--editorial-lead",
        prestigeLead && "dvr-video-card--prestige-lead",
      )}
      style={motionEntranceDelay(index)}
    >
      <div
        className={cn(
          "dvr-video-media relative w-full overflow-hidden rounded-xl",
          topicTile ? "aspect-video" : "dvr-video-media--rail",
        )}
      >
        <VideoThumb item={item} prestige={prestige} />

        {prestige ? (
          <div className="dvr-video-prestige-glow pointer-events-none absolute inset-0 z-2" aria-hidden />
        ) : null}

        <div className="dvr-video-tone-wash pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="dvr-video-read-grad pointer-events-none absolute inset-x-0 bottom-0 z-3" aria-hidden />

        <div className="dvr-video-overlay-top">
          <div className="dvr-video-overlay-top__chips">
            {prestige ? (
              <>
                {prestigeLead ? <span className="dvr-video-prestige-badge">Öne çıkan</span> : null}
                {item.seriesTitle ? (
                  <span className="dvr-video-series-eyebrow">{item.seriesTitle}</span>
                ) : null}
              </>
            ) : (
              <span className={cn("dvr-video-tag", `dvr-video-tag--${tagTone}`)}>{item.tag}</span>
            )}
            {hotViews ? <span className="dvr-video-views-pill">{formatViews(item.views)}</span> : null}
          </div>
          <span className={cn("dvr-duration-badge dvr-duration-badge--video", `dvr-duration-badge--${tagTone}`)}>
            {item.durationLabel}
          </span>
        </div>

        {topicTile ? (
          <div className="dvr-video-topic-footer">
            <p className="dvr-video-topic-footer__title line-clamp-2">{item.title}</p>
            <p className="dvr-video-topic-footer__meta">{item.creator}</p>
          </div>
        ) : (
          <div className="dvr-video-overlay-bottom">
            {prestige && item.episodeLabel ? (
              <p className="dvr-video-overlay-episode">{item.episodeLabel}</p>
            ) : null}
            <p className="dvr-video-overlay-title line-clamp-2">{item.title}</p>
            <div className="dvr-video-overlay-meta-row">
              <span
                className="dvr-video-overlay-avatar"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${item.avatarColor}ee, ${item.avatarColor}88)`,
                }}
                aria-hidden
              >
                {item.avatarInitial}
              </span>
              <p className="dvr-video-overlay-meta-copy">
                <span className="dvr-video-overlay-creator">{item.creator}</span>
                <span className="dvr-video-overlay-sep" aria-hidden>·</span>
                <span className="dvr-video-overlay-stats tabular-nums">
                  {formatViews(item.views)} · {item.publishedAgo}
                </span>
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            "dvr-video-play-fab",
            prestige && "dvr-video-play-fab--prestige",
          )}
          aria-hidden
        >
          <span className="dvr-video-play-fab__ring" aria-hidden />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="dvr-video-play-fab__icon">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        <Link href={item.href} className="dvr-video-hit-layer" aria-label={item.title} />
      </div>

      {topicTile || useOverlayLayout ? null : (
        <div
          className={cn(
            "dvr-video-meta-block",
            prestige && "dvr-video-meta-block--prestige",
          )}
        >
          <div className="dvr-video-meta-row">
            <span
              className="dvr-video-avatar"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${item.avatarColor}ee, ${item.avatarColor}88)`,
              }}
              aria-hidden
            >
              {item.avatarInitial}
            </span>
            <div className="dvr-video-meta-copy">
              <p className={cn("dvr-video-meta truncate", prestige && "dvr-video-meta--prestige")}>
                {item.creator}
              </p>
              <p className="dvr-video-meta-handle truncate">{item.handle}</p>
              <p className={cn("dvr-video-stats tabular-nums", prestige && "dvr-video-stats--prestige")}>
                {formatViews(item.views)} görüntüleme · {item.publishedAgo}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export const DiscoverVideoCard = memo(DiscoverVideoCardInner);
