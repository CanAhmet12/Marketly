"use client";

import { VideoCardFullWidth } from "@/features/discover/cards/VideoCardFullWidth";
import { EmptyState } from "@/components/states";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";

type Props = {
  posts: FeedPost[];
  engagement: HomeEngagementHandlers;
};

export function VideoListRenderer({ posts, engagement }: Props) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="Henüz video içeriği yok"
        description="İlk videoyu sen paylaş!"
        actionLabel="Video Yükle"
        actionHref="/upload"
        compact
      />
    );
  }

  return (
    <ul className="hv-ref-discover-sec hv-ref-discover-sec--videos flex list-none flex-col gap-[var(--hv-s-6)] p-0">
      {posts.map((post, index) => (
        <li key={post.id} className="list-none">
          <VideoCardFullWidth post={post} engagement={engagement} index={index} discoverCinematic />
        </li>
      ))}
    </ul>
  );
}
