"use client";

import Link from "next/link";

import { CreatorAnalystAvatar } from "@/features/creators/components/creator-analyst-avatar";
import { useCreatorFollowAction } from "@/features/creators/hooks/use-creator-follow-action";
import {
  creatorProfileHref,
  getAnalystAccentTone,
  MARKET_LABELS,
} from "@/features/creators/lib/creator-analyst-meta";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

type Props = {
  creator: CreatorDirectoryRow;
  rank: number;
  index?: number;
};

/** Directory feed satırı — tablo değil, kompakt editorial liste */
export function CreatorsScreenerRow({ creator, rank, index = 0 }: Props) {
  const { isFollowing, isPending, toggle } = useCreatorFollowAction(creator.id);
  const tone = getAnalystAccentTone(creator);
  const profileHref = creatorProfileHref(creator);
  const acc = creator.signalAccuracy != null && creator.signalAccuracy > 0
    ? Math.round(creator.signalAccuracy)
    : null;

  return (
    <article
      className={cn(
        "crt-canvas__dir-row motion-entrance",
        `crt-canvas__dir-row--tone-${tone}`,
        creator.isLive && "crt-canvas__dir-row--live",
        creator.rising && "crt-canvas__dir-row--rising",
        creator.editorPick && "crt-canvas__dir-row--pick",
      )}
      style={motionEntranceDelay(index)}
    >
      <Link href={profileHref} className="crt-canvas__dir-hit" aria-label={`${creator.displayName} profili`} />

      <span className="crt-canvas__dir-rank tabular-nums" aria-hidden>
        {String(rank).padStart(2, "0")}
      </span>

      <CreatorAnalystAvatar
        creator={creator}
        variant="screener"
        href={profileHref}
        className="crt-canvas__dir-avatar"
      />

      <div className="crt-canvas__dir-body min-w-0">
        <div className="crt-canvas__dir-top">
          <Link href={profileHref} className="crt-canvas__dir-name truncate">
            {creator.displayName}
          </Link>
          {creator.isLive ? (
            <span className="crt-canvas__dir-live-pill">
              <span className="crt-canvas__dir-live-dot" aria-hidden />
              CANLI
            </span>
          ) : null}
          {creator.editorPick ? <span className="crt-canvas__dir-pick">Seçki</span> : null}
          {creator.rising && !creator.editorPick ? (
            <span className="crt-canvas__dir-rise-badge">↑ Yükselen</span>
          ) : null}
        </div>

        <p className="crt-canvas__dir-handle truncate">{creator.handle}</p>

        <div className="crt-canvas__dir-metrics">
          <span className={cn("crt-canvas__dir-market", `crt-canvas__dir-market--${tone}`)}>
            {MARKET_LABELS[tone]}
          </span>
          {acc != null ? (
            <span className="crt-canvas__dir-metric crt-canvas__dir-metric--acc tabular-nums">
              %{acc} isabet
            </span>
          ) : null}
          {creator.activeSignalsCount > 0 ? (
            <span className="crt-canvas__dir-metric tabular-nums">
              {creator.activeSignalsCount} sinyal
              {creator.bestSignalSymbol ? ` · ${creator.bestSignalSymbol}` : ""}
            </span>
          ) : null}
          <span className="crt-canvas__dir-metric tabular-nums">
            {formatCompactCount(creator.followerCount)} takipçi
          </span>
        </div>

        {acc != null ? (
          <span className="crt-canvas__dir-acc-bar" aria-hidden>
            <span className="crt-canvas__dir-acc-fill" style={{ width: `${acc}%` }} />
          </span>
        ) : null}
      </div>

      <button
        type="button"
        className={cn("crt-canvas__dir-follow", isFollowing && "crt-canvas__dir-follow--active")}
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
    </article>
  );
}
