"use client";

import Link from "next/link";

import { SignalConfBar } from "@/features/discover/visual-reference/discover-signal-tile";
import { useCreatorFollowAction } from "@/features/creators/hooks/use-creator-follow-action";
import {
  accuracyBand,
  creatorPrimaryHref,
  getAnalystAccentTone,
  MARKET_LABELS,
} from "@/features/creators/lib/creator-analyst-meta";
import {
  avatarColorFromCreatorId,
  initialsFromDisplayName,
} from "@/features/creators/lib/map-creator-to-vr";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

type Props = {
  creator: CreatorDirectoryRow;
  index?: number;
  rank?: number;
};

export function CreatorAnalystTapeRow({ creator, index = 0, rank }: Props) {
  const { isFollowing, isPending, toggle } = useCreatorFollowAction(creator.id);
  const tone = getAnalystAccentTone(creator);
  const accBand = accuracyBand(creator.signalAccuracy);
  const href = creatorPrimaryHref(creator);
  const initial = initialsFromDisplayName(creator.displayName);
  const color = avatarColorFromCreatorId(creator.id);

  return (
    <article
      className={cn(
        "crt-analyst-tape group relative z-0 motion-entrance",
        `crt-analyst-tape--tone-${tone}`,
        `crt-analyst-tape--acc-${accBand}`,
        creator.isLive && "crt-analyst-tape--live",
      )}
      style={motionEntranceDelay(index)}
    >
      <Link href={href} className="absolute inset-0 z-0 rounded-[inherit]" aria-label={creator.displayName} />

      {rank != null ? (
        <span className="crt-analyst-tape__rank tabular-nums" aria-hidden>
          {String(rank).padStart(2, "0")}
        </span>
      ) : null}

      <span
        className="crt-analyst-tape__monogram shrink-0"
        style={{ background: `linear-gradient(145deg, ${color}ee, ${color}99)` }}
        aria-hidden
      >
        {initial}
      </span>

      <div className="crt-analyst-tape__main min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={creator.channelHref} className="crt-analyst-tape__name relative z-2 truncate">
            {creator.displayName}
          </Link>
          <span className={cn("crt-analyst-tape__market", `crt-analyst-tape__market--${tone}`)}>
            {MARKET_LABELS[tone]}
          </span>
          {creator.isLive ? <span className="crt-analyst-tape__live-dot" aria-label="Canlı" /> : null}
          {creator.rising ? <span className="crt-analyst-tape__rising">↑</span> : null}
        </div>
        <p className="crt-analyst-tape__meta truncate">
          {creator.handle}
          {creator.bestSignalSymbol ? ` · ${creator.bestSignalSymbol}` : ""}
          {creator.latestHeadline ? ` · ${creator.latestHeadline.slice(0, 48)}` : ""}
        </p>
      </div>

      <div className="crt-analyst-tape__metrics relative z-2 hidden shrink-0 sm:block">
        {creator.signalAccuracy != null && creator.signalAccuracy > 0 ? (
          <SignalConfBar value={Math.round(creator.signalAccuracy)} size="sm" />
        ) : (
          <span className="crt-analyst-tape__followers tabular-nums">
            {formatCompactCount(creator.followerCount)}
          </span>
        )}
      </div>

      <div className="crt-analyst-tape__aside relative z-2 shrink-0">
        <span className="crt-analyst-tape__followers tabular-nums sm:hidden">
          {formatCompactCount(creator.followerCount)}
        </span>
        <button
          type="button"
          className={cn("crt-analyst-tape__follow", isFollowing && "crt-analyst-tape__follow--active")}
          disabled={isPending}
          aria-pressed={isFollowing}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }}
        >
          {isFollowing ? "Takipte" : "Takip"}
        </button>
      </div>
    </article>
  );
}
