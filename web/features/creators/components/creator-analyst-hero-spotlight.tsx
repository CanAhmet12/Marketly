"use client";

import Link from "next/link";

import { CreatorContentMixBar } from "@/features/creators/components/creator-content-mix-bar";
import { SignalConfBar } from "@/features/discover/visual-reference/discover-signal-tile";
import { useCreatorFollowAction } from "@/features/creators/hooks/use-creator-follow-action";
import { buildContentMixSegments } from "@/features/creators/lib/creator-content-mix";
import {
  creatorPrimaryHref,
  getAnalystAccentTone,
  MARKET_LABELS,
  tierLabel,
} from "@/features/creators/lib/creator-analyst-meta";
import {
  avatarColorFromCreatorId,
  initialsFromDisplayName,
} from "@/features/creators/lib/map-creator-to-vr";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

type Props = {
  creator: CreatorDirectoryRow;
};

export function CreatorAnalystHeroSpotlight({ creator }: Props) {
  const { isFollowing, isPending, toggle } = useCreatorFollowAction(creator.id);
  const tone = getAnalystAccentTone(creator);
  const href = creatorPrimaryHref(creator);
  const initial = initialsFromDisplayName(creator.displayName);
  const color = avatarColorFromCreatorId(creator.id);
  const mix = buildContentMixSegments(creator);

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
            <span
              className="crt-hero-spot__monogram"
              style={{ background: `linear-gradient(145deg, ${color}f0, ${color}88)` }}
              aria-hidden
            >
              {initial}
            </span>
            <div className="min-w-0">
              <Link href={creator.channelHref} className="crt-hero-spot__name">
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

          {creator.signalAccuracy != null && creator.signalAccuracy > 0 ? (
            <div className="crt-hero-spot__accuracy crt-hero-spot__accuracy--inline">
              <SignalConfBar value={Math.round(creator.signalAccuracy)} size="md" />
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
            <Link href={href} className="crt-hero-spot__cta">
              {creator.isLive ? "Canlı yayını izle" : "Profili gör"}
            </Link>
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
