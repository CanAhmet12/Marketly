"use client";

import Link from "next/link";

import { CreatorsAnalystRailSection } from "@/features/creators/components/creators-analyst-rail-section";
import { CreatorsIntelligenceDeck } from "@/features/creators/components/creators-intelligence-deck";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";

type PreviewCounts = {
  total: number;
  live: number;
  rising: number;
  editor?: number;
  avgAccuracy?: number | null;
};

type Props = {
  live: CreatorDirectoryRow[];
  rising: CreatorDirectoryRow[];
  directory: CreatorDirectoryRow[];
  forYou: CreatorDirectoryRow[];
  forYouHeadline: string;
  counts: PreviewCounts;
};

/**
 * Keşfet → Üreticiler hub önizlemesi.
 * /creators ray dili — intelligence deck + yatay analist rayları.
 */
export function DiscoverCreatorsTabPreview({
  live,
  rising,
  directory,
  forYou,
  forYouHeadline,
  counts,
}: Props) {
  const deckCounts = {
    total: counts.total,
    live: counts.live,
    rising: counts.rising,
    editor: counts.editor ?? directory.filter((c) => c.editorPick).length,
    avgAccuracy: counts.avgAccuracy ?? null,
  };

  return (
    <div className="dsc-hub-tab dsc-hub-tab--creators crt-canvas crt-canvas--discover-embed">
      <header className="dsc-hub-tab__head">
        <div>
          <span className="dsc-hub-tab__kicker">Keşfet · Üreticiler</span>
          <h2 className="dsc-hub-tab__title">Analist masaları</h2>
          <p className="dsc-hub-tab__sub">Tam dizinde ara, filtrele ve masaya katıl</p>
        </div>
        <span className="dsc-hub-tab__badge tabular-nums">{counts.total} analist</span>
      </header>

      <CreatorsIntelligenceDeck counts={deckCounts} />

      {forYou.length > 0 ? (
        <CreatorsAnalystRailSection
          label={forYouHeadline}
          variant="personalized"
          creators={forYou}
          featured
          seeAllHref={DISCOVER_VERTICAL_ROUTES.creators}
        />
      ) : null}

      <CreatorsAnalystRailSection
        label="Şu an yayında"
        variant="live"
        creators={live}
        seeAllHref={DISCOVER_VERTICAL_ROUTES.creators}
      />

      <CreatorsAnalystRailSection
        label="Yükselen momentum"
        variant="rising"
        creators={rising}
        seeAllHref={DISCOVER_VERTICAL_ROUTES.creators}
      />

      {directory.length > 0 ? (
        <CreatorsAnalystRailSection
          label="Popüler masalar"
          variant="featured"
          creators={directory}
          featured
          seeAllHref={DISCOVER_VERTICAL_ROUTES.creators}
        />
      ) : null}

      <Link href={DISCOVER_VERTICAL_ROUTES.creators} className="dsc-hub-tab__cta">
        <span>Üretici dizinini aç</span>
        <span className="dsc-hub-tab__cta-arrow" aria-hidden>
          →
        </span>
      </Link>
    </div>
  );
}
