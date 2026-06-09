"use client";

import Link from "next/link";
import { useState, memo, type ComponentType } from "react";
import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { getCardTagTone } from "./discover-card-tones";
import { formatViews, type VRPulseItem } from "./discover-visual-reference-data";
import {
  ThumbPulse1, ThumbPulse2, ThumbPulse3,
  ThumbPulse4, ThumbPulse5, ThumbPulse6,
  ThumbGeneric,
} from "./vr-thumbnails";

export type PulseTier = "featured" | "standard" | "tall";
export type PulseVariant = "default" | "trending" | "breaking";

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
              className="dvr-pulse-thumb-photo absolute inset-0 z-0"
              sizes="(max-width: 640px) 52vw, 300px"
              onFailed={() => setImgFailed(true)}
            />
          ) : (
            <img
              src={url}
              alt=""
              className="dvr-pulse-thumb-photo absolute inset-0 z-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          )}
        </>
      ) : (
        <>
          <div className="dvr-pulse-thumb-chart pointer-events-none absolute inset-0 z-0 [&_svg]:opacity-[0.28]">
            <Thumb />
          </div>
          <div className="dvr-pulse-thumb-grain pointer-events-none absolute inset-0 z-1" aria-hidden />
        </>
      )}
      <div className="dvr-pulse-media-glint pointer-events-none absolute inset-0 z-1" aria-hidden />
      <div className="dvr-pulse-media-veil pointer-events-none absolute inset-0 z-2" aria-hidden />
      <div className="dvr-pulse-media-scan pointer-events-none absolute inset-0 z-2" aria-hidden />
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

function DiscoverPulseCardInner({
  item,
  tier = "standard",
  index = 0,
  variant = "default",
  density = "rail",
  topicTile = false,
  editorialLead = false,
  valleyLead = false,
}: {
  item: VRPulseItem;
  tier?: PulseTier;
  index?: number;
  variant?: PulseVariant;
  density?: "rail" | "topic";
  topicTile?: boolean;
  editorialLead?: boolean;
  valleyLead?: boolean;
}) {
  const isTall = tier === "tall";
  const isFeatured = tier === "featured";
  const tagTone = getCardTagTone(item.tag);
  const useOverlayLayout = !topicTile;

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
        "dvr-pulse-card dvr-pulse-card--premium group flex flex-col",
        `dvr-pulse-card--tone-${tagTone}`,
        isFeatured && "dvr-pulse-card--featured",
        isTall && "dvr-pulse-card--tall",
        variant === "trending" && "dvr-pulse-card--trending",
        variant === "breaking" && "dvr-pulse-card--breaking",
        density === "topic" && "dvr-pulse-card--topic-density",
        topicTile && "dvr-pulse-card--topic-tile",
        useOverlayLayout && "dvr-pulse-card--overlay-v2",
        editorialLead && "dvr-pulse-card--editorial-lead",
        valleyLead && "dvr-pulse-card--valley-lead",
        "motion-entrance",
      )}
      style={motionEntranceDelay(index)}
    >
      <div className={cn("dvr-pulse-media relative overflow-hidden rounded-xl", thumbClass)}>
        <PulseThumb item={item} />

        {variant === "breaking" ? (
          <div className="dvr-pulse-breaking-glow pointer-events-none absolute inset-0 z-2" aria-hidden />
        ) : null}
        {variant === "trending" ? (
          <div className="dvr-pulse-trending-glow pointer-events-none absolute inset-0 z-2" aria-hidden />
        ) : null}

        <div className="dvr-pulse-tone-wash pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="dvr-pulse-read-grad pointer-events-none absolute inset-x-0 bottom-0 z-3" aria-hidden />

        <div className="dvr-pulse-overlay-top">
          <div className="dvr-pulse-overlay-top__chips">
            {variant === "breaking" ? (
              <span className="dvr-pulse-variant-badge dvr-pulse-variant-badge--breaking">
                <span className="dvr-pulse-variant-badge__dot" aria-hidden />
                Kırılma
              </span>
            ) : null}
            {variant === "trending" ? (
              <span className="dvr-pulse-variant-badge dvr-pulse-variant-badge--trending">
                <span className="dvr-pulse-variant-badge__dot" aria-hidden />
                Trend
              </span>
            ) : null}
            <span className={cn("dvr-pulse-tag", `dvr-pulse-tag--${tagTone}`)}>{item.tag}</span>
            {item.formatLabel ? (
              <span className="dvr-pulse-format-pill">{item.formatLabel}</span>
            ) : null}
          </div>
          <span className={cn("dvr-duration-badge dvr-duration-badge--pulse", `dvr-duration-badge--${tagTone}`)}>
            {item.durationLabel}
          </span>
        </div>

        <div className="dvr-pulse-play-fab" aria-hidden>
          <span className="dvr-pulse-play-fab__ring" aria-hidden />
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white" className="dvr-pulse-play-fab__icon">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {topicTile ? (
          <div className="dvr-pulse-topic-footer">
            <p className="dvr-pulse-topic-footer__title line-clamp-2">{item.title}</p>
            <p className="dvr-pulse-topic-footer__meta">
              {item.creator} · {formatViews(item.views)}
            </p>
          </div>
        ) : (
          <div className="dvr-pulse-overlay-bottom">
            {item.hookLine ? (
              <p className="dvr-pulse-overlay-hook line-clamp-1">"{item.hookLine}"</p>
            ) : null}
            <p className="dvr-pulse-overlay-title line-clamp-3">{item.title}</p>
            <div className="dvr-pulse-overlay-meta-row">
              {item.avatarInitial && item.avatarColor ? (
                <span
                  className="dvr-pulse-overlay-avatar"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${item.avatarColor}ee, ${item.avatarColor}88)`,
                  }}
                  aria-hidden
                >
                  {item.avatarInitial}
                </span>
              ) : null}
              <p className="dvr-pulse-overlay-meta-copy">
                <span className="dvr-pulse-overlay-creator">{item.creator}</span>
                <span className="dvr-pulse-overlay-sep" aria-hidden>·</span>
                <span className="dvr-pulse-overlay-views tabular-nums">
                  {formatViews(item.views)} izlenme
                </span>
              </p>
            </div>
          </div>
        )}

        <Link href={item.href} className="dvr-pulse-hit-layer" aria-label={item.title} />
      </div>
    </article>
  );
}

export const DiscoverPulseCard = memo(DiscoverPulseCardInner);
