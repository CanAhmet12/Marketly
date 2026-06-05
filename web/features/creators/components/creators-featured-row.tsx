"use client";

import type { CreatorDirectoryRow } from "@/features/creators/types";
import { CreatorDirectoryCard } from "@/features/creators/components/creator-directory-card";

type Props = {
  creators: CreatorDirectoryRow[];
};

export function CreatorsFeaturedRow({ creators }: Props) {
  if (!creators.length) return null;

  return (
    <section className="creators-page__section" aria-label="Editör seçkisi">
      <div className="creators-page__section-head">
        <h2 className="creators-page__section-title">Editör seçkisi</h2>
        <p className="creators-page__section-sub">Güven skoru, canlı yayın ve topluluk kanıtına göre</p>
      </div>
      <div className="creators-page__featured-grid">
        {creators.map((c) => (
          <CreatorDirectoryCard key={c.id} creator={c} variant="featured" />
        ))}
      </div>
    </section>
  );
}
