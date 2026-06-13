"use client";

import { cn } from "@/lib/cn";
import { RailSeeAll } from "@/features/discover/visual-reference/discover-vr-primitives";

export type DiscoverTabIntroVariant = "live" | "pulse" | "videos" | "signals" | "creators";

type Props = {
  variant: DiscoverTabIntroVariant;
  kicker: string;
  line: string;
  count: number | string;
  countSuffix: string;
  countAriaLabel?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
};

function IntroCountMark({ variant }: { variant: DiscoverTabIntroVariant }) {
  if (variant === "live") {
    return <span className="dvr-live-tab-dot" aria-hidden />;
  }
  if (variant === "pulse") {
    return <span className="dvr-tab-intro__pulse-mark" aria-hidden />;
  }
  if (variant === "videos") {
    return <span className="dvr-tab-intro__video-mark" aria-hidden />;
  }
  if (variant === "signals") {
    return <span className="dvr-tab-intro__signal-mark" aria-hidden />;
  }
  return <span className="dvr-tab-intro__creator-mark" aria-hidden />;
}

/** Keşfet hub sekmeleri — ortak intro şeridi */
export function DiscoverTabIntro({
  variant,
  kicker,
  line,
  count,
  countSuffix,
  countAriaLabel,
  seeAllHref,
  seeAllLabel = "Tümünü gör",
}: Props) {
  return (
    <div className={cn("dvr-tab-intro", `dvr-tab-intro--${variant}`)}>
      <div className="dvr-tab-intro__copy">
        <span className="dvr-tab-intro__kicker">{kicker}</span>
        <p className="dvr-tab-intro__line">{line}</p>
      </div>
      <div className="dvr-tab-intro__actions">
        {seeAllHref ? <RailSeeAll href={seeAllHref} label={seeAllLabel} /> : null}
        <span className="dvr-tab-intro__count" aria-label={countAriaLabel ?? `${count} ${countSuffix}`}>
          <IntroCountMark variant={variant} />
          {count} {countSuffix}
        </span>
      </div>
    </div>
  );
}
