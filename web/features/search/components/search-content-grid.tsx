"use client";

import { LiveCard } from "@/features/discover/cards/LiveCard";
import { PulseCard } from "@/features/discover/cards/PulseCard";
import { VideoCard } from "@/features/discover/cards/VideoCard";
import { FeedPostCard } from "@/features/feed/feed-post-card";
import { searchPostToFeedPost } from "@/features/search/adapters/search-post-to-feed-post";
import { useSearchEngagement } from "@/features/search/hooks/use-search-engagement";
import type { SearchPostHit } from "@/features/search/types";

type Props = {
  videos: SearchPostHit[];
  pulsePosts: SearchPostHit[];
  livePosts: SearchPostHit[];
  textPosts: SearchPostHit[];
  /** Federated preview limit per section */
  limit?: number | null;
};

export function SearchContentGrid({ videos, pulsePosts, livePosts, textPosts, limit = null }: Props) {
  const { handlers: engagement, applyOverlay } = useSearchEngagement();

  const slice = <T,>(arr: T[]) => (limit != null ? arr.slice(0, limit) : arr);

  return (
    <div className="sch-entity-stack">
      {slice(videos).length > 0 ? (
        <section className="sch-entity-section" aria-label="Videolar">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Videolar</h2> : null}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3 xl:grid-cols-4">
            {slice(videos).map((p, i) => (
              <VideoCard key={p.id} post={applyOverlay(searchPostToFeedPost(p))} engagement={engagement} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {slice(livePosts).length > 0 ? (
        <section className="sch-entity-section" aria-label="Canlı">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Canlı</h2> : null}
          <ul className="discover-live-hub__stack discover-live-hub__stack--tab m-0 list-none p-0">
            {slice(livePosts).map((p, i) => (
              <li key={p.id}>
                <LiveCard
                  post={applyOverlay(searchPostToFeedPost(p))}
                  engagement={engagement}
                  index={i}
                  discoverLiveVariant="secondary"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {slice(pulsePosts).length > 0 ? (
        <section className="sch-entity-section" aria-label="Pulse">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Pulse</h2> : null}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {slice(pulsePosts).map((p, i) => (
              <PulseCard key={p.id} post={applyOverlay(searchPostToFeedPost(p))} engagement={engagement} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {slice(textPosts).length > 0 ? (
        <section className="sch-entity-section" aria-label="Gönderiler">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Gönderiler</h2> : null}
          <div className="flex flex-col gap-2">
            {slice(textPosts).map((p) => {
              const post = applyOverlay(searchPostToFeedPost(p));
              return (
                <FeedPostCard
                  key={p.id}
                  post={post}
                  isLoggedIn={engagement.isLoggedIn}
                  likePending={engagement.likePendingPostId === post.id}
                  savePending={engagement.savePendingPostId === post.id}
                  onToggleLike={() => engagement.onToggleLike(post)}
                  onToggleSave={() => engagement.onToggleSave(post)}
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
