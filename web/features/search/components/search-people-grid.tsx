"use client";

import { SearchCreatorHit } from "@/features/search/components/hits/search-creator-hit";
import { SearchRoomHit } from "@/features/search/components/rows/search-room-hit";
import type { CreatorRoomSearchHit, SearchChannelHit } from "@/features/search/types";

type Props = {
  channels: SearchChannelHit[];
  creatorRooms: CreatorRoomSearchHit[];
  limit?: number | null;
  compact?: boolean;
};

export function SearchPeopleGrid({ channels, creatorRooms, limit = null, compact = false }: Props) {
  const rail = limit != null;
  const slice = <T,>(arr: T[]) => (limit != null ? arr.slice(0, limit) : arr);
  const channelSlice = slice(channels);

  if (rail) {
    return (
      <div className="srch-rail-entities">
        {channelSlice.length > 0 ? (
          <section className="srch-rail-entity" aria-label="Üreticiler">
            <ul className="srch-rail-track srch-rail-track--people m-0 list-none p-0">
              {channelSlice.map((c) => (
                <li key={c.id} className="min-w-0">
                  <SearchCreatorHit channel={c} compact />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {slice(creatorRooms).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Odalar">
            <div className="srch-rail-track srch-rail-track--stack">
              {slice(creatorRooms).map((r) => (
                <SearchRoomHit key={`${r.room_id}:${r.href}`} room={r} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="srch-tab-panel">
      {channels.length > 0 ? (
        <section className="srch-tab-section" aria-label="Üreticiler">
          <h2 className="srch-tab-section__title">Üreticiler</h2>
          <div className="srch-hit-list">
            {channels.map((c) => (
              <SearchCreatorHit key={c.id} channel={c} />
            ))}
          </div>
        </section>
      ) : null}

      {creatorRooms.length > 0 ? (
        <section className="srch-tab-section" aria-label="Odalar">
          <h2 className="srch-tab-section__title">Odalar</h2>
          <div className="srch-hit-list">
            {creatorRooms.map((r) => (
              <SearchRoomHit key={`${r.room_id}:${r.href}`} room={r} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
