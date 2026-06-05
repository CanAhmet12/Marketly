"use client";

import type { CreatorDirectoryRow } from "@/features/creators/types";
import { CreatorDirectoryCard } from "@/features/creators/components/creator-directory-card";

type Props = {
  groups: { asset: string; rows: CreatorDirectoryRow[] }[];
};

export function CreatorsAssetSections({ groups }: Props) {
  if (!groups.length) return null;

  return (
    <>
      {groups.map((g) => (
        <section key={g.asset} className="creators-page__section" aria-label={`${g.asset} masası`}>
          <div className="creators-page__section-head creators-page__section-head--row">
            <div>
              <h2 className="creators-page__section-title">{g.asset} masası</h2>
              <p className="creators-page__section-sub">Bu varlıkta aktif üreticiler</p>
            </div>
            <a href={`/creators?asset=${encodeURIComponent(g.asset)}`} className="creators-page__section-link">
              Tümünü gör →
            </a>
          </div>
          <ul className="creators-page__grid creators-page__grid--compact m-0 list-none p-0">
            {g.rows.map((c) => (
              <li key={c.id}>
                <CreatorDirectoryCard creator={c} variant="compact" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
