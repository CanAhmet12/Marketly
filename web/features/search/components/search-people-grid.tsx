"use client";

import { CreatorDirectoryCard } from "@/features/creators/components/creator-directory-card";
import { searchChannelToCreatorRow } from "@/features/search/adapters/search-channel-to-creator-row";
import { SearchRoomHit } from "@/features/search/components/rows/search-room-hit";
import type { CreatorRoomSearchHit, SearchChannelHit } from "@/features/search/types";

type Props = {
  channels: SearchChannelHit[];
  creatorRooms: CreatorRoomSearchHit[];
  limit?: number | null;
  compact?: boolean;
};

export function SearchPeopleGrid({ channels, creatorRooms, limit = null, compact = false }: Props) {
  const slice = <T,>(arr: T[]) => (limit != null ? arr.slice(0, limit) : arr);
  const channelSlice = slice(channels);

  return (
    <div className="sch-entity-stack">
      {channelSlice.length > 0 ? (
        <section className="sch-entity-section" aria-label="Üreticiler">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Üreticiler</h2> : null}
          <ul className="creators-page__grid m-0 list-none p-0">
            {channelSlice.map((c) => (
              <li key={c.id} className="min-w-0">
                <CreatorDirectoryCard creator={searchChannelToCreatorRow(c)} variant={compact ? "compact" : "default"} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {slice(creatorRooms).length > 0 ? (
        <section className="sch-entity-section" aria-label="Odalar">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Odalar</h2> : null}
          <div className="flex flex-col gap-2">
            {slice(creatorRooms).map((r) => (
              <SearchRoomHit key={`${r.room_id}:${r.href}`} room={r} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
