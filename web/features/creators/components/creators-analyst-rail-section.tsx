"use client";

import { CreatorAnalystRailCard } from "@/features/creators/components/creator-analyst-rail-card";
import { HScroll, Rail } from "@/features/discover/visual-reference/discover-vr-primitives";
import type { CreatorDirectoryRow } from "@/features/creators/types";

type Props = {
  label: string;
  seriesKicker?: string;
  accent?: "live" | "teal" | "signal" | "peak";
  creators: CreatorDirectoryRow[];
  featured?: boolean;
  seeAllHref?: string;
};

/** Paylaşılan yatay analist rayı — /creators + keşfet hub */
export function CreatorsAnalystRailSection({
  label,
  seriesKicker,
  accent = "teal",
  creators,
  featured = false,
  seeAllHref,
}: Props) {
  if (creators.length === 0) return null;

  return (
    <Rail label={label} seriesKicker={seriesKicker} accent={accent} seeAllHref={seeAllHref}>
      <HScroll className="crt-v2-hscroll">
        {creators.map((c, i) => (
          <div key={c.id} className="crt-v2-rail-item">
            <CreatorAnalystRailCard creator={c} index={i} featured={featured} />
          </div>
        ))}
      </HScroll>
    </Rail>
  );
}
