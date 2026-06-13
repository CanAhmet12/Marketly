"use client";

import { CreatorsAnalystRailSection } from "@/features/creators/components/creators-analyst-rail-section";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { cn } from "@/lib/cn";

type Props = {
  creators: CreatorDirectoryRow[];
  headline: string;
  isPersonalized?: boolean;
};

/** Kişiselleştirilmiş / öne çıkan analist rayı */
export function CreatorsPersonalizedRail({ creators, headline, isPersonalized = false }: Props) {
  if (creators.length === 0) return null;

  return (
    <div
      className={cn(
        "crt-canvas__personalized-zone",
        isPersonalized && "crt-canvas__personalized-zone--affinity",
      )}
    >
      <CreatorsAnalystRailSection
        label={headline}
        accent="teal"
        variant={isPersonalized ? "personalized" : "featured"}
        creators={creators}
      />
    </div>
  );
}
