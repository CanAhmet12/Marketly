"use client";

import { useMemo } from "react";

import { SignalHeroSpotlight } from "@/features/signals/components/signal-hero-spotlight";
import { SignalsConfidenceLeaderboard } from "@/features/signals/components/signals-confidence-leaderboard";
import { pickHeroSignal, topSignalsByConfidence } from "@/features/signals/lib/pick-hero-signal";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

type Props = {
  catalogRows: SignalsFeedRow[];
  onOpen: (row: SignalsFeedRow) => void;
};

/** FAZ B — hero spotlight + güven liderleri */
export function SignalsHeroBento({ catalogRows, onOpen }: Props) {
  const hero = useMemo(() => pickHeroSignal(catalogRows), [catalogRows]);
  const leaders = useMemo(() => {
    if (!hero) return topSignalsByConfidence(catalogRows, undefined, 3);
    const rest = topSignalsByConfidence(catalogRows, hero.id, 4);
    return rest.length > 0 ? rest.slice(0, 3) : topSignalsByConfidence(catalogRows, undefined, 3);
  }, [catalogRows, hero]);

  if (!hero) return null;

  const badge =
    hero.confidence >= 85 ? "Yüksek güven" : hero.thesis_grade === "A" ? "A tez" : "Editör masası";

  return (
    <section className="sig-canvas__spotlight-zone" aria-label="Öne çıkan sinyal">
      <header className="sig-canvas__spotlight-head">
        <div>
          <span className="sig-canvas__spotlight-kicker">Spotlight</span>
          <h2 className="sig-canvas__spotlight-title">Editör masası</h2>
        </div>
        <span className="sig-canvas__spotlight-badge">{badge}</span>
      </header>

      <div className="sig-canvas__hero-bento">
        <div className="sig-canvas__hero-main">
          <SignalHeroSpotlight signal={hero} onOpen={() => onOpen(hero)} />
        </div>
        <SignalsConfidenceLeaderboard leaders={leaders} onOpen={onOpen} />
      </div>
    </section>
  );
}

export function SignalsHeroBentoSkeleton() {
  return (
    <div className="sig-canvas__spotlight-zone" aria-hidden>
      <div className="sig-canvas__sk-spotlight-head">
        <div>
          <div className="sig-canvas__sk-spotlight-kicker motion-shimmer" />
          <div className="sig-canvas__sk-spotlight-title motion-shimmer" />
        </div>
        <div className="sig-canvas__sk-spotlight-badge motion-shimmer" />
      </div>
      <div className="sig-canvas__sk-hero sig-canvas__hero-bento motion-shimmer" />
    </div>
  );
}
