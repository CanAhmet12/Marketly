"use client";

import { PulseCard } from "@/features/discover/cards/PulseCard";
import { EmptyState } from "@/components/states";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";

type Props = {
  posts: FeedPost[];
  engagement: HomeEngagementHandlers;
};

export function PulseGridRenderer({ posts, engagement }: Props) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="Henüz pulse içeriği yok"
        description="İlk pulse videoyu sen paylaş!"
        actionLabel="Video Yükle"
        actionHref="/upload"
        compact
      />
    );
  }

  return (
    <div className="hv-discover-band hv-discover-band--pulse min-w-0">
      <div className="grid min-w-0 grid-cols-2 gap-[var(--hv-s-3)] sm:gap-[var(--hv-s-4)]">
        {posts.slice(0, 2).map((post, index) => (
          <div key={post.id} className="flex min-w-0 justify-center">
            <PulseCard post={post} engagement={engagement} index={index} discoverTier="featured" />
          </div>
        ))}
      </div>
      {posts.length > 2 ? (
        <div className="mt-[var(--hv-s-4)] grid min-w-0 grid-cols-2 gap-[var(--hv-s-3)] min-[480px]:grid-cols-3 lg:grid-cols-4">
          {posts.slice(2, 14).map((post, index) => (
            <div key={post.id} className="flex min-w-0 justify-center">
              <PulseCard post={post} engagement={engagement} index={index + 2} discoverTier="medium" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
