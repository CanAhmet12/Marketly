"use client";

import Link from "next/link";
import { useState, memo, type ComponentType } from "react";
import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { getCardTagTone } from "./discover-card-tones";
import { formatViewers, type VRLiveItem } from "./discover-visual-reference-data";
import {
  ThumbLive1, ThumbLive2, ThumbLive3,
  ThumbLive4, ThumbLive5, ThumbLive6,
  ThumbGeneric,
} from "./vr-thumbnails";

function LiveBadge({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={cn("dvr-live-badge", size === "sm" && "dvr-live-badge--sm")}>
      <span className="dvr-live-badge__dot" aria-hidden />
      Canlı
    </span>
  );
}

function ViewerBadge({ count }: { count: number }) {
  return (
    <span className="dvr-viewer-badge dvr-viewer-badge--live">
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
      className={cn("dvr-live-avatar", liveRing && "dvr-live-avatar--live")}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}88)`,
      }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function LiveHeatPill({ chatPerMin }: { chatPerMin: number }) {
  return (
    <span className="dvr-live-heat-pill">
      <span className="dvr-live-heat-pill__dot" aria-hidden />
      {chatPerMin}+ sohbet/dk
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
              sizes={rail ? "(max-width: 640px) 88vw, 640px" : "(max-width: 640px) 72vw, 480px"}
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
      {!showPhoto ? (
        <>
          <div className="dvr-live-thumb-grain pointer-events-none absolute inset-0 z-1" aria-hidden />
          <div className="dvr-live-thumb-vignette pointer-events-none absolute inset-0 z-2" aria-hidden />
        </>
      ) : null}
    </div>
  );
}

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
  const tagTone = getCardTagTone(item.tag);

  return (
    <article
      className={cn(
        "dvr-live-card dvr-live-card--rail dvr-live-card--premium group relative flex w-full flex-col overflow-hidden rounded-2xl",
        `dvr-live-card--tone-${tagTone}`,
        item.heat === "high" && "dvr-live-card--heat",
        urgencyLead && "dvr-live-card--urgency-lead",
        "motion-entrance",
      )}
      style={motionEntranceDelay(index)}
    >
      <div className="dvr-live-media dvr-live-media--rail relative w-full overflow-hidden rounded-2xl">
        <LiveThumbLayer item={item} variant="rail" />
        <div className="dvr-live-tone-wash pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="dvr-live-media-glint pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="dvr-live-broadcast-veil pointer-events-none absolute inset-0 z-2" aria-hidden />
        {item.heat === "high" ? (
          <div className="dvr-live-heat-glow pointer-events-none absolute inset-0 z-2 rounded-2xl" aria-hidden />
        ) : null}
        <div className="dvr-live-media-scan pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 dvr-live-read-grad" aria-hidden />

        <div className="dvr-live-overlay-top">
          <div className="dvr-live-overlay-top__left">
            <LiveBadge size="sm" />
            <span className={cn("dvr-live-tag-min", `dvr-live-tag-min--${tagTone}`)}>{item.tag}</span>
            {item.heat === "high" && item.chatPerMin != null && item.chatPerMin >= 50 ? (
              <LiveHeatPill chatPerMin={item.chatPerMin} />
            ) : null}
          </div>
          <ViewerBadge count={item.viewers} />
        </div>

        <Link href={item.href} className="dvr-live-play-anchor dvr-live-play-fab dvr-live-play-fab--rail dvr-live-play-fab--corner" aria-label="İzle">
          <span className="dvr-live-play-fab__ring" aria-hidden />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="dvr-live-play-fab__icon" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </Link>

        <div className="dvr-live-overlay-bottom">
          <p className="dvr-live-title dvr-live-title--hero line-clamp-2">{item.title}</p>
          <div className="dvr-live-meta-row">
            <AvatarFallback initial={item.avatarInitial} color={item.avatarColor} size={36} liveRing={hostLiveRing} />
            <p className="dvr-live-meta-copy">
              <span className="dvr-live-meta-creator">{item.creator}</span>
              <span className="dvr-live-meta-sep" aria-hidden>·</span>
              <span className="dvr-live-meta-viewers">{formatViewers(item.viewers)} izleyici</span>
            </p>
          </div>
        </div>

        <Link href={item.href} className="dvr-live-hit-layer" aria-label={item.title} />
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
  topicTile?: boolean;
}) {
  const hostLiveRing = item.heat === "high" || (item.chatPerMin != null && item.chatPerMin >= 50);
  const tagTone = getCardTagTone(item.tag);

  return (
    <article
      className={cn(
        "dvr-live-card dvr-live-card--compact dvr-live-card--premium group relative flex w-full flex-col overflow-hidden rounded-xl",
        `dvr-live-card--tone-${tagTone}`,
        item.heat === "high" && "dvr-live-card--heat",
        topicTile && "dvr-live-card--topic-tile",
        !topicTile && "dvr-live-card--overlay-v2",
        "motion-entrance",
      )}
      style={motionEntranceDelay(index)}
    >
      <div className="dvr-live-media dvr-live-media--compact relative w-full overflow-hidden rounded-xl">
        <LiveThumbLayer item={item} variant="compact" />
        <div className="dvr-live-tone-wash pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="dvr-live-media-glint pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="dvr-live-broadcast-veil pointer-events-none absolute inset-0 z-2" aria-hidden />
        {item.heat === "high" ? (
          <div className="dvr-live-heat-glow pointer-events-none absolute inset-0 z-2 rounded-xl" aria-hidden />
        ) : null}
        <div className="dvr-live-media-scan pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 dvr-live-read-grad dvr-live-read-grad--compact" aria-hidden />

        <div className="dvr-live-overlay-top dvr-live-overlay-top--compact">
          <div className="dvr-live-overlay-top__left">
            <LiveBadge size="sm" />
            <span className={cn("dvr-live-tag-min dvr-live-tag-min--compact", `dvr-live-tag-min--${tagTone}`)}>{item.tag}</span>
            {item.heat === "high" && item.chatPerMin != null && item.chatPerMin >= 50 ? (
              <LiveHeatPill chatPerMin={item.chatPerMin} />
            ) : null}
          </div>
          <ViewerBadge count={item.viewers} />
        </div>

        <Link href={item.href} className="dvr-live-play-anchor--compact dvr-live-play-fab dvr-live-play-fab--compact dvr-live-play-fab--corner" aria-label="İzle">
          <span className="dvr-live-play-fab__ring" aria-hidden />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="dvr-live-play-fab__icon" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </Link>

        {topicTile ? (
          <div className="dvr-live-overlay-bottom dvr-live-overlay-bottom--compact">
            <p className="dvr-live-title dvr-live-title--compact line-clamp-2">{item.title}</p>
          </div>
        ) : (
          <div className="dvr-live-overlay-bottom dvr-live-overlay-bottom--compact">
            <p className="dvr-live-title dvr-live-title--compact line-clamp-2">{item.title}</p>
            <div className="dvr-live-overlay-meta-row">
              <AvatarFallback initial={item.avatarInitial} color={item.avatarColor} size={32} liveRing={hostLiveRing} />
              <p className="dvr-live-overlay-meta-copy">
                <span className="dvr-live-overlay-creator">{item.creator}</span>
                <span className="dvr-live-overlay-sep" aria-hidden>·</span>
                <span className="dvr-live-overlay-viewers tabular-nums">{formatViewers(item.viewers)} izleyici</span>
              </p>
            </div>
          </div>
        )}

        <Link href={item.href} className="dvr-live-hit-layer" aria-label={item.title} />
      </div>
    </article>
  );
}

export const DiscoverLiveCardCompact = memo(DiscoverLiveCardCompactInner);
