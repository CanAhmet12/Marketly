"use client";

import Link from "next/link";

import { CreatorAnalystAvatar } from "@/features/creators/components/creator-analyst-avatar";
import { CreatorContentMixBar } from "@/features/creators/components/creator-content-mix-bar";
import { SignalConfBar } from "@/features/discover/visual-reference/discover-signal-tile";
import { useCreatorFollowAction } from "@/features/creators/hooks/use-creator-follow-action";
import { buildContentMixSegments } from "@/features/creators/lib/creator-content-mix";
import {
  creatorPrimaryHref,
  creatorProfileHref,
  formatProofLine,
  getAnalystAccentTone,
  MARKET_LABELS,
  tierLabel,
} from "@/features/creators/lib/creator-analyst-meta";
import { formatCompactCount } from "@/lib/format-compact-count";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

type Props = {
  creator: CreatorDirectoryRow;
};

export function CreatorAnalystHeroSpotlight({ creator }: Props) {
  const { isFollowing, isPending, toggle } = useCreatorFollowAction(creator.id);
  const tone = getAnalystAccentTone(creator);
  const profileHref = creatorProfileHref(creator);
  const contentHref = creatorPrimaryHref(creator);
  const mix = buildContentMixSegments(creator);
  const headline =
    creator.latestHeadline?.trim() ||
    creator.specialties[0]?.slice(0, 96) ||
    creator.bio?.slice(0, 96) ||
    formatProofLine(creator);
  const accPct =
    creator.signalAccuracy != null && creator.signalAccuracy > 0
      ? Math.round(creator.signalAccuracy)
      : null;

  return (
    <article
      className={cn(
        "crt-hero-spot motion-entrance",
        `crt-hero-spot--tone-${tone}`,
        creator.isLive && "crt-hero-spot--live",
      )}
      style={motionEntranceDelay(0)}
    >
      <div className="crt-hero-spot__wash" aria-hidden />
      <div className="crt-hero-spot__accent" aria-hidden />

      <div className="crt-hero-spot__inner">
        <div className="crt-hero-spot__left">
          <div className="crt-hero-spot__badge-row">
            {creator.isLive ? (
              <span className="crt-hero-spot__live-pill">
                <span className="crt-hero-spot__live-dot" aria-hidden />
                Şu an yayında
              </span>
            ) : creator.editorPick ? (
              <span className="crt-hero-spot__pick-pill">Editör seçkisi</span>
            ) : (
              <span className="crt-hero-spot__pick-pill crt-hero-spot__pick-pill--muted">Öne çıkan</span>
            )}
            <span className={cn("crt-hero-spot__market", `crt-hero-spot__market--${tone}`)}>
              {MARKET_LABELS[tone]}
            </span>
          </div>

          <div className="crt-hero-spot__identity">
            <CreatorAnalystAvatar creator={creator} variant="hero" href={profileHref} priority />
            <div className="min-w-0">
              <Link href={profileHref} className="crt-hero-spot__name">
                {creator.displayName}
              </Link>
              <p className="crt-hero-spot__meta">
                <span className="crt-hero-spot__handle">{creator.handle}</span>
                <span className="crt-hero-spot__tier-pill">
                  {tierLabel(creator.tier)}
                  {creator.verified ? " · ✓" : ""}
                </span>
              </p>
            </div>
          </div>

          <p className="crt-hero-spot__headline">{headline}</p>

          <div className="crt-hero-spot__stats">
            <span className="crt-hero-spot__stat">
              <strong className="tabular-nums">{formatCompactCount(creator.followerCount)}</strong> takipçi
            </span>
            <span className="crt-hero-spot__stat">
              <strong className="tabular-nums">
                {creator.activeSignalsCount > 0 ? creator.activeSignalsCount : "—"}
              </strong>{" "}
              sinyal
            </span>
            {accPct != null ? (
              <span className="crt-hero-spot__stat crt-hero-spot__stat--acc">
                <strong className="tabular-nums">%{accPct}</strong> isabet
              </span>
            ) : null}
          </div>

          {accPct != null ? (
            <div className="crt-hero-spot__accuracy crt-hero-spot__accuracy--inline">
              <SignalConfBar value={accPct} size="md" />
            </div>
          ) : null}
        </div>

        <div className="crt-hero-spot__right">
          <CreatorContentMixBar segments={mix} />

          {creator.assetTags.length > 0 ? (
            <div className="crt-hero-spot__chips">
              {creator.assetTags.slice(0, 4).map((tag) => (
                <span key={tag} className="crt-hero-spot__chip">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="crt-hero-spot__actions">
            <Link href={profileHref} className="crt-hero-spot__cta crt-hero-spot__cta--profile">
              Profili gör
            </Link>
            {creator.isLive && contentHref !== profileHref ? (
              <Link href={contentHref} className="crt-hero-spot__cta crt-hero-spot__cta--live">
                Canlı izle
              </Link>
            ) : null}
            <button
              type="button"
              className={cn("crt-hero-spot__follow", isFollowing && "crt-hero-spot__follow--active")}
              disabled={isPending}
              aria-pressed={isFollowing}
              onClick={() => toggle()}
            >
              {isFollowing ? "Takipte" : "Takip et"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
