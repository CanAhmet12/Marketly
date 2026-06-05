"use client";

import type { CreatorDirectoryRow } from "@/features/creators/types";
import { CreatorsLiveAvatar } from "@/features/creators/components/creators-live-avatar";

type Props = {
  creators: CreatorDirectoryRow[];
};

export function CreatorsLiveStrip({ creators }: Props) {
  if (!creators.length) return null;

  return (
    <section className="creators-page__section" aria-label="Canlı şimdi">
      <div className="creators-page__section-head">
        <h2 className="creators-page__section-title">
          <span className="creators-page__live-dot" aria-hidden />
          Canlı şimdi
        </h2>
        <p className="creators-page__section-sub">Yayında olan üreticiler — önizleme ile hızlı tarama</p>
      </div>
      <div className="creators-page__live-track">
        {creators.slice(0, 12).map((c) => (
          <CreatorsLiveAvatar key={c.id} creator={c} />
        ))}
      </div>
    </section>
  );
}
