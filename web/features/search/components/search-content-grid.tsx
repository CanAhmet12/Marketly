"use client";

import { SearchContentHit } from "@/features/search/components/hits/search-content-hit";
import type { SearchPostHit } from "@/features/search/types";

type Props = {
  videos: SearchPostHit[];
  pulsePosts: SearchPostHit[];
  livePosts: SearchPostHit[];
  textPosts: SearchPostHit[];
  limit?: number | null;
};

export function SearchContentGrid({ videos, pulsePosts, livePosts, textPosts, limit = null }: Props) {
  const rail = limit != null;
  const slice = <T,>(arr: T[]) => (limit != null ? arr.slice(0, limit) : arr);

  if (rail) {
    return (
      <div className="srch-rail-entities">
        {slice(videos).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Videolar">
            <div className="srch-rail-track srch-rail-track--video">
              {slice(videos).map((p) => (
                <SearchContentHit key={p.id} post={p} variant="video" />
              ))}
            </div>
          </section>
        ) : null}
        {slice(livePosts).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Canlı">
            <ul className="srch-rail-track srch-rail-track--live">
              {slice(livePosts).map((p) => (
                <li key={p.id} className="min-w-0">
                  <SearchContentHit post={p} variant="live" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {slice(pulsePosts).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Pulse">
            <div className="srch-rail-track srch-rail-track--pulse">
              {slice(pulsePosts).map((p) => (
                <SearchContentHit key={p.id} post={p} variant="pulse" />
              ))}
            </div>
          </section>
        ) : null}
        {slice(textPosts).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Gönderiler">
            <div className="srch-rail-track srch-rail-track--stack">
              {slice(textPosts).map((p) => (
                <SearchContentHit key={p.id} post={p} variant="post" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="srch-tab-panel">
      {videos.length > 0 ? (
        <section className="srch-tab-section" aria-label="Videolar">
          <h2 className="srch-tab-section__title">Videolar</h2>
          <div className="srch-hit-grid srch-hit-grid--video">
            {videos.map((p) => (
              <SearchContentHit key={p.id} post={p} variant="video" />
            ))}
          </div>
        </section>
      ) : null}

      {livePosts.length > 0 ? (
        <section className="srch-tab-section" aria-label="Canlı">
          <h2 className="srch-tab-section__title">Canlı</h2>
          <div className="srch-hit-grid srch-hit-grid--live">
            {livePosts.map((p) => (
              <SearchContentHit key={p.id} post={p} variant="live" />
            ))}
          </div>
        </section>
      ) : null}

      {pulsePosts.length > 0 ? (
        <section className="srch-tab-section" aria-label="Pulse">
          <h2 className="srch-tab-section__title">Pulse</h2>
          <div className="srch-hit-grid srch-hit-grid--pulse">
            {pulsePosts.map((p) => (
              <SearchContentHit key={p.id} post={p} variant="pulse" />
            ))}
          </div>
        </section>
      ) : null}

      {textPosts.length > 0 ? (
        <section className="srch-tab-section" aria-label="Gönderiler">
          <h2 className="srch-tab-section__title">Gönderiler</h2>
          <div className="srch-hit-list">
            {textPosts.map((p) => (
              <SearchContentHit key={p.id} post={p} variant="post" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
