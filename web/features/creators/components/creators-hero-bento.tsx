"use client";

import { CreatorAnalystHeroSpotlight } from "@/features/creators/components/creator-analyst-hero-spotlight";
import { CreatorsAccuracyLeaderboard } from "@/features/creators/components/creators-accuracy-leaderboard";
import type { CreatorDirectoryRow } from "@/features/creators/types";

type Props = {
  hero: CreatorDirectoryRow;
  topAccuracy: CreatorDirectoryRow[];
};

/** BÖLÜM 2 — hero spotlight + isabet liderleri */
export function CreatorsHeroBento({ hero, topAccuracy }: Props) {
  const leaders = topAccuracy.filter((c) => c.id !== hero.id).slice(0, 3);
  const leadersWithHero =
    leaders.length > 0 ? leaders : topAccuracy.slice(0, 3);

  return (
    <section className="crt-canvas__spotlight-zone" aria-label="Öne çıkan analist">
      <header className="crt-canvas__spotlight-head">
        <div>
          <span className="crt-canvas__spotlight-kicker">Spotlight</span>
          <h2 className="crt-canvas__spotlight-title">Editör masası</h2>
        </div>
        {hero.editorPick ? (
          <span className="crt-canvas__spotlight-badge">Editör seçkisi</span>
        ) : hero.isLive ? (
          <span className="crt-canvas__spotlight-badge">Canlı masa</span>
        ) : null}
      </header>

      <div className="crt-canvas__hero-bento">
        <div className="crt-canvas__hero-main">
          <CreatorAnalystHeroSpotlight creator={hero} />
        </div>
        <CreatorsAccuracyLeaderboard leaders={leadersWithHero} />
      </div>
    </section>
  );
}
