"use client";

import { SearchCommunityHit } from "@/features/search/components/rows/search-community-hit";
import { SearchDiscussionHit } from "@/features/search/components/rows/search-discussion-hit";
import type { CommunitySearchHit, DiscussionSearchHit } from "@/features/search/types";

type Props = {
  discussions: DiscussionSearchHit[];
  communities: CommunitySearchHit[];
  limit?: number | null;
};

export function SearchCommunityList({ discussions, communities, limit = null }: Props) {
  const rail = limit != null;
  const slice = <T,>(arr: T[]) => (limit != null ? arr.slice(0, limit) : arr);

  if (rail) {
    return (
      <div className="srch-rail-entities">
        {slice(discussions).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Tartışmalar">
            <div className="srch-rail-track srch-rail-track--stack">
              {slice(discussions).map((d) => (
                <SearchDiscussionHit key={d.id} discussion={d} />
              ))}
            </div>
          </section>
        ) : null}
        {slice(communities).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Topluluklar">
            <div className="srch-rail-track srch-rail-track--stack">
              {slice(communities).map((c) => (
                <SearchCommunityHit key={c.id} community={c} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="srch-tab-panel">
      {discussions.length > 0 ? (
        <section className="srch-tab-section" aria-label="Tartışmalar">
          <h2 className="srch-tab-section__title">Tartışmalar</h2>
          <div className="srch-hit-list">
            {discussions.map((d) => (
              <SearchDiscussionHit key={d.id} discussion={d} />
            ))}
          </div>
        </section>
      ) : null}

      {communities.length > 0 ? (
        <section className="srch-tab-section" aria-label="Topluluklar">
          <h2 className="srch-tab-section__title">Topluluklar</h2>
          <div className="srch-hit-list">
            {communities.map((c) => (
              <SearchCommunityHit key={c.id} community={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
