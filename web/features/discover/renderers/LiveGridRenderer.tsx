"use client";

import { LiveCard } from "@/features/discover/cards/LiveCard";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";

type Props = {
  posts: FeedPost[];
  engagement: HomeEngagementHandlers;
};

export function LiveGridRenderer({ posts, engagement }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center py-[var(--hv-s-8)]">
        <p className="text-[0.984375rem] font-semibold text-[var(--hv-text-2)]">Şu anda canlı yayın yok</p>
        <p className="mt-2 max-w-[24rem] text-center text-[0.875rem] leading-relaxed text-[var(--hv-text-3)]">
          Yayın başlatan ilk kişi sen ol.
        </p>
      </div>
    );
  }

  const [head, ...tail] = posts;

  return (
    <div className="discover-live-hub flex min-w-0 flex-col gap-[var(--hv-s-4)] sm:gap-[var(--hv-s-5)]">
      <LiveCard post={head} engagement={engagement} index={0} feedSurface="default" discoverLiveVariant="featured" />
      {tail.length > 0 ? (
        <ul className="discover-live-hub__stack discover-live-hub__stack--tab m-0 list-none p-0">
          {tail.map((post, index) => (
            <li key={post.id} className="min-w-0">
              <LiveCard post={post} engagement={engagement} index={index + 1} feedSurface="default" discoverLiveVariant="secondary" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
