"use client";

import { useMemo } from "react";

import { CreatorsDirectoryState } from "@/features/creators/components/creators-directory-states";
import {
  CreatorsCatalogDiscoveryRails,
  CreatorsDiscoveryRails,
  CreatorsLiveDiscoveryRail,
} from "@/features/creators/components/creators-discovery-rails";
import { CreatorsHeroBento } from "@/features/creators/components/creators-hero-bento";
import { CreatorsPersonalizedRail } from "@/features/creators/components/creators-personalized-rail";
import { CreatorsScreenerBoard } from "@/features/creators/components/creators-screener-board";
import { pickHeroCreator } from "@/features/creators/lib/creator-content-mix";
import type { CreatorsViewTab } from "@/features/creators/lib/creators-directory-config";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { cn } from "@/lib/cn";

type StreamProps = {
  filtered: CreatorDirectoryRow[];
  featured: CreatorDirectoryRow[];
  live: CreatorDirectoryRow[];
  rising: CreatorDirectoryRow[];
  personalized: CreatorDirectoryRow[];
  personalizedHeadline: string;
  isPersonalized: boolean;
  activeTab: CreatorsViewTab;
  hasActiveFilters: boolean;
  refining?: boolean;
};

function useStreamSlices(props: StreamProps) {
  const showFullExperience = !props.hasActiveFilters && props.activeTab === "all";

  const topByAccuracy = useMemo(
    () =>
      [...props.filtered]
        .filter((c) => c.signalAccuracy != null && c.signalAccuracy > 0)
        .sort((a, b) => (b.signalAccuracy ?? 0) - (a.signalAccuracy ?? 0))
        .slice(0, 8),
    [props.filtered],
  );

  const hero = useMemo(
    () => (showFullExperience ? pickHeroCreator(props.live, props.featured) : null),
    [showFullExperience, props.live, props.featured],
  );

  const isEmpty =
    props.filtered.length === 0 && props.featured.length === 0 && props.live.length === 0;

  return { showFullExperience, topByAccuracy, hero, isEmpty };
}

/** Sol sütun — sağ context rail ile hizalı (hero + öne çıkan + canlı) */
export function CreatorsDirectoryStreamColumn(props: StreamProps) {
  const { showFullExperience, topByAccuracy, hero, isEmpty } = useStreamSlices(props);

  if (isEmpty) {
    return (
      <CreatorsDirectoryState variant={props.hasActiveFilters ? "filtered" : "empty"} />
    );
  }

  return (
    <div
      className={cn(
        "crt-canvas__stream crt-canvas__stream--col",
        props.refining && "crt-canvas__stream--refining",
      )}
    >
      {showFullExperience && hero ? (
        <CreatorsHeroBento hero={hero} topAccuracy={topByAccuracy} />
      ) : null}

      {showFullExperience ? (
        <CreatorsPersonalizedRail
          creators={props.personalized}
          headline={props.personalizedHeadline}
          isPersonalized={props.isPersonalized}
        />
      ) : null}

      {showFullExperience ? <CreatorsLiveDiscoveryRail live={props.live} /> : null}
    </div>
  );
}

/** Tam genişlik — rail altı boşluk (editör / yükselen / isabet + screener) */
export function CreatorsDirectoryStreamFull(props: StreamProps) {
  const { showFullExperience, topByAccuracy, isEmpty } = useStreamSlices(props);

  if (isEmpty) return null;

  return (
    <div
      className={cn(
        "crt-canvas__stream crt-canvas__stream--full",
        props.refining && "crt-canvas__stream--refining",
      )}
    >
      {showFullExperience ? (
        <CreatorsCatalogDiscoveryRails
          featured={props.featured}
          rising={props.rising}
          topByAccuracy={topByAccuracy}
        />
      ) : null}

      <CreatorsScreenerBoard rows={props.filtered} activeTab={props.activeTab} refining={props.refining} />
    </div>
  );
}

/** Mobil — tek sütun (eski davranış) */
export function CreatorsDirectoryStream(props: StreamProps) {
  const { showFullExperience, topByAccuracy, hero, isEmpty } = useStreamSlices(props);

  if (isEmpty) {
    return (
      <CreatorsDirectoryState variant={props.hasActiveFilters ? "filtered" : "empty"} />
    );
  }

  return (
    <div className={cn("crt-canvas__stream", props.refining && "crt-canvas__stream--refining")}>
      {showFullExperience && hero ? (
        <CreatorsHeroBento hero={hero} topAccuracy={topByAccuracy} />
      ) : null}

      {showFullExperience ? (
        <CreatorsPersonalizedRail
          creators={props.personalized}
          headline={props.personalizedHeadline}
          isPersonalized={props.isPersonalized}
        />
      ) : null}

      {showFullExperience ? (
        <CreatorsDiscoveryRails
          live={props.live}
          featured={props.featured}
          rising={props.rising}
          topByAccuracy={topByAccuracy}
        />
      ) : null}

      <CreatorsScreenerBoard rows={props.filtered} activeTab={props.activeTab} refining={props.refining} />
    </div>
  );
}
