"use client";

import { useMemo } from "react";

import { CreatorsAnalystRailSection } from "@/features/creators/components/creators-analyst-rail-section";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { formatCompactCount } from "@/lib/format-compact-count";

type Props = {
  live: CreatorDirectoryRow[];
  featured: CreatorDirectoryRow[];
  rising: CreatorDirectoryRow[];
  topByAccuracy: CreatorDirectoryRow[];
};

type RailDef = {
  variant: "live" | "editor" | "rising" | "accuracy";
  label: string;
  creators: CreatorDirectoryRow[];
  featured?: boolean;
};

function buildRailDefs(live: CreatorDirectoryRow[], featured: CreatorDirectoryRow[], rising: CreatorDirectoryRow[], topByAccuracy: CreatorDirectoryRow[]): RailDef[] {
  const defs: RailDef[] = [
    { variant: "live", label: "Canlı masalar", creators: live },
    { variant: "editor", label: "Editör seçkisi", creators: featured, featured: true },
    { variant: "rising", label: "Yükselen hız", creators: rising },
    { variant: "accuracy", label: "İsabet liderleri", creators: topByAccuracy },
  ];
  return defs.filter((r) => r.creators.length > 0);
}

/** Rail yanında — yalnızca canlı masalar */
export function CreatorsLiveDiscoveryRail({ live }: Pick<Props, "live">) {
  if (live.length === 0) return null;

  return (
    <section className="crt-canvas__discovery-zone crt-canvas__discovery-zone--live-col" aria-label="Canlı masalar">
      <CreatorsAnalystRailSection variant="live" label="Canlı masalar" creators={live} />
    </section>
  );
}

/** Rail altı tam genişlik — editör / yükselen / isabet */
export function CreatorsCatalogDiscoveryRails({ featured, rising, topByAccuracy }: Pick<Props, "featured" | "rising" | "topByAccuracy">) {
  const rails = useMemo(
    () => buildRailDefs([], featured, rising, topByAccuracy),
    [featured, rising, topByAccuracy],
  );

  if (rails.length === 0) return null;

  const totalCount = rails.reduce((n, r) => n + r.creators.length, 0);

  return (
    <section className="crt-canvas__discovery-zone crt-canvas__discovery-zone--full" aria-label="Analist keşif rayları">
      <header className="crt-canvas__discovery-head">
        <div>
          <span className="crt-canvas__discovery-kicker">Discovery</span>
          <h2 className="crt-canvas__discovery-title">Analist rayları</h2>
        </div>
        <span className="crt-canvas__discovery-badge tabular-nums">
          {formatCompactCount(totalCount)} masa
        </span>
      </header>

      <div className="crt-canvas__discovery-rails">
        {rails.map((rail) => (
          <CreatorsAnalystRailSection
            key={rail.variant}
            variant={rail.variant}
            label={rail.label}
            creators={rail.creators}
            featured={rail.featured}
          />
        ))}
      </div>
    </section>
  );
}

/** Tüm raylar — mobil / tek sütun */
export function CreatorsDiscoveryRails({ live, featured, rising, topByAccuracy }: Props) {
  const rails = useMemo(
    () => buildRailDefs(live, featured, rising, topByAccuracy),
    [live, featured, rising, topByAccuracy],
  );

  if (rails.length === 0) return null;

  const totalCount = rails.reduce((n, r) => n + r.creators.length, 0);

  return (
    <section className="crt-canvas__discovery-zone" aria-label="Analist keşif rayları">
      <header className="crt-canvas__discovery-head">
        <div>
          <span className="crt-canvas__discovery-kicker">Discovery</span>
          <h2 className="crt-canvas__discovery-title">Analist rayları</h2>
        </div>
        <span className="crt-canvas__discovery-badge tabular-nums">
          {formatCompactCount(totalCount)} masa
        </span>
      </header>

      <div className="crt-canvas__discovery-rails">
        {rails.map((rail) => (
          <CreatorsAnalystRailSection
            key={rail.variant}
            variant={rail.variant}
            label={rail.label}
            creators={rail.creators}
            featured={rail.featured}
          />
        ))}
      </div>
    </section>
  );
}
