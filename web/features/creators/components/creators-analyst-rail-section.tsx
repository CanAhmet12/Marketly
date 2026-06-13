"use client";

import { CreatorAnalystRailCard } from "@/features/creators/components/creator-analyst-rail-card";
import { HScroll, Rail, type RailAccent } from "@/features/discover/visual-reference/discover-vr-primitives";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { cn } from "@/lib/cn";

export type CreatorsRailVariant = "live" | "editor" | "rising" | "accuracy" | "featured" | "personalized";

const VARIANT_META: Record<
  CreatorsRailVariant,
  { seriesKicker?: string; accent: RailAccent; railClass: string; hscrollClass: string }
> = {
  live: {
    seriesKicker: "Live",
    accent: "live",
    railClass: "crt-canvas__discovery-rail crt-canvas__discovery-rail--live",
    hscrollClass: "crt-canvas__discovery-hscroll crt-canvas__discovery-hscroll--live",
  },
  editor: {
    seriesKicker: "Curated",
    accent: "signal",
    railClass: "crt-canvas__discovery-rail crt-canvas__discovery-rail--editor",
    hscrollClass: "crt-canvas__discovery-hscroll crt-canvas__discovery-hscroll--editor",
  },
  rising: {
    seriesKicker: "Momentum",
    accent: "peak",
    railClass: "crt-canvas__discovery-rail crt-canvas__discovery-rail--rising",
    hscrollClass: "crt-canvas__discovery-hscroll crt-canvas__discovery-hscroll--rising",
  },
  accuracy: {
    seriesKicker: "Track",
    accent: "signal",
    railClass: "crt-canvas__discovery-rail crt-canvas__discovery-rail--accuracy",
    hscrollClass: "crt-canvas__discovery-hscroll crt-canvas__discovery-hscroll--accuracy",
  },
  featured: {
    seriesKicker: "Öne çıkan",
    accent: "teal",
    railClass: "crt-canvas__discovery-rail crt-canvas__discovery-rail--featured",
    hscrollClass: "crt-canvas__discovery-hscroll crt-canvas__discovery-hscroll--featured",
  },
  personalized: {
    seriesKicker: "Affinity",
    accent: "teal",
    railClass: "crt-canvas__discovery-rail crt-canvas__discovery-rail--personalized",
    hscrollClass: "crt-canvas__discovery-hscroll crt-canvas__discovery-hscroll--personalized",
  },
};

type Props = {
  label: string;
  seriesKicker?: string;
  accent?: RailAccent;
  variant?: CreatorsRailVariant;
  creators: CreatorDirectoryRow[];
  featured?: boolean;
  seeAllHref?: string;
  className?: string;
};

/** Paylaşılan yatay analist rayı — /creators + keşfet hub */
export function CreatorsAnalystRailSection({
  label,
  seriesKicker,
  accent,
  variant,
  creators,
  featured = false,
  seeAllHref,
  className,
}: Props) {
  if (creators.length === 0) return null;

  const meta = variant ? VARIANT_META[variant] : null;
  const resolvedAccent = accent ?? meta?.accent ?? "teal";
  const resolvedKicker = seriesKicker ?? meta?.seriesKicker;

  return (
    <Rail
      label={label}
      seriesKicker={resolvedKicker}
      accent={resolvedAccent}
      seeAllHref={seeAllHref}
      className={cn(meta?.railClass, className)}
    >
      <HScroll className={cn("crt-v2-hscroll", meta?.hscrollClass)}>
        {creators.map((c, i) => (
          <div key={c.id} className="crt-v2-rail-item">
            <CreatorAnalystRailCard creator={c} index={i} featured={featured} />
          </div>
        ))}
      </HScroll>
    </Rail>
  );
}
