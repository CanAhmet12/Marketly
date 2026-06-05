"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { useCreatorFollowAction } from "@/features/creators/hooks/use-creator-follow-action";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { tierDotClass } from "@/features/watch/watch-helpers";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type Props = {
  creator: CreatorDirectoryRow;
  variant?: "default" | "featured" | "compact";
};

function formatLabels(creator: CreatorDirectoryRow): string {
  const parts: string[] = [];
  if (creator.formatCounts.live) parts.push(`${creator.formatCounts.live} canlı`);
  if (creator.formatCounts.video) parts.push(`${creator.formatCounts.video} video`);
  if (creator.formatCounts.pulse) parts.push(`${creator.formatCounts.pulse} pulse`);
  if (creator.activeSignalsCount) parts.push(`${creator.activeSignalsCount} sinyal`);
  return parts.slice(0, 3).join(" · ") || "İçerik üreticisi";
}

export function CreatorDirectoryCard({ creator, variant = "default" }: Props) {
  const { isFollowing, isPending, toggle } = useCreatorFollowAction(creator.id);
  const featured = variant === "featured";
  const compact = variant === "compact";
  const previewHref = creator.isLive && creator.liveHref ? creator.liveHref : creator.latestContentHref ?? creator.channelHref;

  return (
    <article
      className={cn(
        "creators-card",
        featured && "creators-card--featured",
        compact && "creators-card--compact",
        creator.isLive && "creators-card--live",
      )}
    >
      <Link href={creator.channelHref} className="creators-card__cover-link" aria-label={creator.displayName} tabIndex={-1} />

      <div className="creators-card__inner">
        <div className={cn("creators-card__top", compact && "creators-card__top--compact")}>
          <div className="creators-card__avatar-wrap">
            <SafeAvatar
              src={creator.avatarUrl ?? ""}
              alt=""
              size={featured ? 56 : compact ? 40 : 48}
              className={cn("creators-card__avatar", creator.isLive && "creators-card__avatar--live")}
            />
            {creator.isLive ? <span className="creators-card__live-badge">CANLI</span> : null}
          </div>

          <div className="creators-card__identity min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <Link href={creator.channelHref} className="creators-card__name truncate">
                {creator.displayName}
              </Link>
              <span className={cn("creators-card__tier-dot", tierDotClass(creator.tier))} title={creator.tier} />
              {creator.verified ? (
                <span className="creators-card__verified" aria-label="Doğrulanmış" title="Doğrulanmış">
                  ✓
                </span>
              ) : null}
            </div>
            <p className="creators-card__handle truncate">{creator.handle}</p>
            {creator.specialties.length ? (
              <p className="creators-card__specialty line-clamp-1">{creator.specialties.slice(0, 3).join(" · ")}</p>
            ) : null}
          </div>

          {!compact ? (
            <button
              type="button"
              className={cn("creators-card__follow", isFollowing && "creators-card__follow--active")}
              disabled={isPending}
              aria-pressed={isFollowing}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
              }}
            >
              {isFollowing ? "Takipte" : "Takip et"}
            </button>
          ) : null}

          {compact && creator.latestThumbnailUrl ? (
            <Link
              href={previewHref}
              className="creators-card__thumb-side"
              onClick={(e) => e.stopPropagation()}
              aria-label={`${creator.displayName} son içerik`}
            >
              <img src={creator.latestThumbnailUrl} alt="" className="creators-card__thumb-side-img" loading="lazy" />
              {creator.isLive ? <span className="creators-card__thumb-live">CANLI</span> : null}
            </Link>
          ) : null}
        </div>

        {creator.bio && (featured || compact) ? (
          <p className={cn("creators-card__bio", featured ? "line-clamp-2" : "line-clamp-1")}>{creator.bio}</p>
        ) : null}

        <div className="creators-card__proof">
          {creator.signalAccuracy != null ? (
            <span className="creators-card__proof-item creators-card__proof-item--accent">
              %{creator.signalAccuracy} isabet
            </span>
          ) : null}
          {creator.bestSignalSymbol ? (
            <span className="creators-card__proof-item">
              {creator.bestSignalSymbol}
              {creator.bestSignalConfidence != null ? ` · %${creator.bestSignalConfidence}` : ""}
            </span>
          ) : null}
          <span className="creators-card__proof-item">{formatCompactCount(creator.followerCount)} takipçi</span>
        </div>

        {!compact && creator.assetTags.length ? (
          <div className="creators-card__tags">
            {creator.assetTags.slice(0, 4).map((tag) => (
              <Link
                key={tag}
                href={`/creators?asset=${encodeURIComponent(tag)}`}
                className="creators-card__tag"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="creators-card__footer">
          <span className="creators-card__formats truncate">{formatLabels(creator)}</span>
          {creator.latestHeadline && creator.latestContentHref ? (
            <Link href={creator.latestContentHref} className="creators-card__latest truncate" onClick={(e) => e.stopPropagation()}>
              {creator.latestHeadline}
            </Link>
          ) : null}
          {creator.isLive && creator.liveHref ? (
            <Link href={creator.liveHref} className="creators-card__watch-cta" onClick={(e) => e.stopPropagation()}>
              Canlı yayını izle →
            </Link>
          ) : null}
        </div>

        {(featured || (!compact && creator.latestThumbnailUrl)) && creator.latestThumbnailUrl ? (
          <Link href={previewHref} className="creators-card__preview" onClick={(e) => e.stopPropagation()}>
            <img src={creator.latestThumbnailUrl} alt="" className="creators-card__preview-img" loading="lazy" />
            {creator.isLive ? <span className="creators-card__preview-live">CANLI</span> : null}
          </Link>
        ) : null}

        {creator.rising ? <span className="creators-card__rising">Yükselen</span> : null}
        {creator.editorPick && featured ? <span className="creators-card__pick">Seçki</span> : null}
      </div>
    </article>
  );
}
