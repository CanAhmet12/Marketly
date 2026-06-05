"use client";

import type { CreatorDirectoryRow } from "@/features/creators/types";
import { CreatorDirectoryCard } from "@/features/creators/components/creator-directory-card";

type Props = {
  creators: CreatorDirectoryRow[];
};

export function CreatorsRisingRow({ creators }: Props) {
  if (!creators.length) return null;

  return (
    <section className="creators-page__section" aria-label="Yükselen üreticiler">
      <div className="creators-page__section-head">
        <h2 className="creators-page__section-title">Yükselen üreticiler</h2>
        <p className="creators-page__section-sub">Son dönemde ivme kazanan analistler — tazelik vitrini</p>
      </div>
      <div className="creators-page__rising-track">
        {creators.map((c) => (
          <div key={c.id} className="creators-page__rising-item">
            <CreatorDirectoryCard creator={c} variant="compact" />
          </div>
        ))}
      </div>
    </section>
  );
}
