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
  const slice = <T,>(arr: T[]) => (limit != null ? arr.slice(0, limit) : arr);

  return (
    <div className="sch-entity-stack">
      {slice(discussions).length > 0 ? (
        <section className="sch-entity-section" aria-label="Tartışmalar">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Tartışmalar</h2> : null}
          <div className="flex flex-col gap-2">
            {slice(discussions).map((d) => (
              <SearchDiscussionHit key={d.id} discussion={d} />
            ))}
          </div>
        </section>
      ) : null}

      {slice(communities).length > 0 ? (
        <section className="sch-entity-section" aria-label="Topluluklar">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Topluluklar</h2> : null}
          <div className="flex flex-col gap-2">
            {slice(communities).map((c) => (
              <SearchCommunityHit key={c.id} community={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
