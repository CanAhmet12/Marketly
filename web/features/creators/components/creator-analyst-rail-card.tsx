"use client";

import Link from "next/link";

import { CreatorAnalystAvatar } from "@/features/creators/components/creator-analyst-avatar";
import { CreatorContentMixBar } from "@/features/creators/components/creator-content-mix-bar";
import { useCreatorFollowAction } from "@/features/creators/hooks/use-creator-follow-action";
import { buildContentMixSegments } from "@/features/creators/lib/creator-content-mix";
import {
  accuracyBand,
  creatorProfileHref,
  formatProofLine,
  getAnalystAccentTone,
  MARKET_LABELS,
  tierLabel,
} from "@/features/creators/lib/creator-analyst-meta";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

type Props = {
  creator: CreatorDirectoryRow;
  index?: number;
  /** Öne çıkan kart — biraz daha geniş vurgu */
  featured?: boolean;
};

function LivePulse() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/50 motion-reduce:animate-none" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
    </span>
  );
}

export function CreatorAnalystRailCard({ creator, index = 0, featured = false }: Props) {
  const { isFollowing, isPending, toggle } = useCreatorFollowAction(creator.id);
  const tone = getAnalystAccentTone(creator);
  const accBand = accuracyBand(creator.signalAccuracy);
  const profileHref = creatorProfileHref(creator);
  const liveHref = creator.isLive && creator.liveHref ? creator.liveHref : null;
  const headline =
    creator.latestHeadline?.trim() ||
    creator.specialties[0]?.slice(0, 72) ||
    creator.bio?.slice(0, 72) ||
    "Piyasa analizi ve canlı akış";
  const mix = buildContentMixSegments(creator);

  return (
    <article
      className={cn(
        "crt-analyst-card group relative z-0 motion-entrance",
        `crt-analyst-card--tone-${tone}`,
        `crt-analyst-card--acc-${accBand}`,
        creator.isLive && "crt-analyst-card--live",
        featured && "crt-analyst-card--featured",
        creator.rising && "crt-analyst-card--rising",
        creator.editorPick && "crt-analyst-card--pick",
      )}
      style={motionEntranceDelay(index)}
    >
      <Link
        href={profileHref}
        className="absolute inset-0 z-0 rounded-[inherit]"
        aria-label={`${creator.displayName} profili`}
      />
      <div className="crt-analyst-card__glow" aria-hidden />
      <div className="crt-analyst-card__accent" aria-hidden />
      <div className="crt-analyst-card__sheen" aria-hidden />

      <div className="crt-analyst-card__inner">
        <div className="crt-analyst-card__head">
          <div className="crt-analyst-card__identity">
            <CreatorAnalystAvatar creator={creator} variant="rail" href={profileHref} />
            <div className="crt-analyst-card__copy min-w-0">
              <Link href={profileHref} className="crt-analyst-card__name truncate relative z-2">
                {creator.displayName}
              </Link>
              <p className="crt-analyst-card__handle truncate">{creator.handle}</p>
              <span className={cn("crt-analyst-card__market", `crt-analyst-card__market--${tone}`)}>
                {MARKET_LABELS[tone]}
              </span>
            </div>
          </div>

          <div className="crt-analyst-card__badges shrink-0">
            {creator.editorPick ? (
              <span className="crt-analyst-card__status crt-analyst-card__status--pick">Seçki</span>
            ) : null}
            {creator.rising && !creator.editorPick ? (
              <span className="crt-analyst-card__status crt-analyst-card__status--rising">↑ Yükselen</span>
            ) : null}
            {creator.isLive ? (
              <span className="crt-analyst-card__live-pill">
                <LivePulse />
                CANLI
              </span>
            ) : (
              <span className={cn("crt-analyst-card__tier", `crt-analyst-card__tier--${creator.tier}`)}>
                {tierLabel(creator.tier)}
              </span>
            )}
            {creator.verified ? <span className="crt-analyst-card__verified" title="Doğrulanmış">✓</span> : null}
          </div>
        </div>

        <p className="crt-analyst-card__headline line-clamp-2">{headline}</p>

        <div className="crt-analyst-card__metrics">
          <span className="crt-analyst-card__metric">
            <span className="crt-analyst-card__metric-val tabular-nums">
              {formatCompactCount(creator.followerCount)}
            </span>
            <span className="crt-analyst-card__metric-lab">Takipçi</span>
          </span>
          <span className="crt-analyst-card__metric">
            <span className="crt-analyst-card__metric-val tabular-nums">
              {creator.activeSignalsCount > 0 ? creator.activeSignalsCount : "—"}
            </span>
            <span className="crt-analyst-card__metric-lab">Sinyal</span>
          </span>
          <span className={cn("crt-analyst-card__metric", creator.signalAccuracy != null && "crt-analyst-card__metric--acc")}>
            <span className="crt-analyst-card__metric-val tabular-nums">
              {creator.signalAccuracy != null && creator.signalAccuracy > 0
                ? `%${Math.round(creator.signalAccuracy)}`
                : "—"}
            </span>
            <span className="crt-analyst-card__metric-lab">İsabet</span>
          </span>
        </div>

        {creator.assetTags.length > 0 ? (
          <div className="crt-analyst-card__chips">
            {creator.assetTags.slice(0, 3).map((tag) => (
              <span key={tag} className="crt-analyst-card__chip">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <CreatorContentMixBar segments={mix} className="crt-analyst-card__mix" />

        <div className="crt-analyst-card__footer">
          <span className="crt-analyst-card__proof truncate">{formatProofLine(creator)}</span>
          <div className="crt-analyst-card__actions">
            <Link
              href={profileHref}
              className="crt-analyst-card__profile"
              onClick={(e) => e.stopPropagation()}
            >
              Profil
            </Link>
            {liveHref ? (
              <Link href={liveHref} className="crt-analyst-card__watch" onClick={(e) => e.stopPropagation()}>
                İzle
              </Link>
            ) : null}
            <button
            type="button"
            className={cn("crt-analyst-card__follow", isFollowing && "crt-analyst-card__follow--active")}
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
        </div>
      </div>
    </article>
  );
}
