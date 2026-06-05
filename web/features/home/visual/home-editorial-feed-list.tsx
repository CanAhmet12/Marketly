"use client";

import { useCallback } from "react";

import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { homeFeedCardEstimate, useWindowVirtualListVariable } from "@/hooks/use-virtual-list";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

import { HomeVisualPostCard } from "./home-visual-post-card";

type Props = {
  posts: FeedPost[];
  engagement: HomeEngagementHandlers;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

function renderPostCard(
  post: FeedPost,
  index: number,
  engagement: HomeEngagementHandlers,
  virtualized: boolean,
) {
  const stripe = index > 0 && index % 2 === 1;
  return (
    <HomeVisualPostCard
      key={post.id}
      mode="feed"
      post={post}
      lead={index === 0}
      engagement={engagement}
      className={cn("motion-entrance", stripe && "hv-ref-article--stripe")}
      style={virtualized ? undefined : motionEntranceDelay(index)}
    />
  );
}

/** P9-003/004 — home akış listesi (window virtualize + infinite sentinel) */
export function HomeEditorialFeedList({
  posts,
  engagement,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props) {
  const estimateSize = useCallback((index: number) => homeFeedCardEstimate(index), []);

  const vt = useWindowVirtualListVariable({
    count: posts.length,
    estimateSize,
    overscan: 4,
  });

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    onLoadMore();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <>
      {vt.enabled && vt.virtualItems ? (
        <div style={{ height: vt.totalSize, position: "relative", width: "100%" }}>
          {vt.virtualItems.map((vRow) => {
            const post = posts[vRow.index]!;
            return (
              <div
                key={post.id}
                data-index={vRow.index}
                ref={vt.virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${vRow.start}px)`,
                }}
              >
                {renderPostCard(post, vRow.index, engagement, true)}
              </div>
            );
          })}
        </div>
      ) : (
        posts.map((post, index) => renderPostCard(post, index, engagement, false))
      )}

      {hasNextPage ? (
        <>
          <InfiniteScrollSentinel enabled={!isFetchingNextPage} onVisible={loadMore} />
          {isFetchingNextPage ? (
            <p
              className="flex justify-center py-[var(--hv-s-6)] text-[0.875rem] text-[var(--hv-text-3)]"
              aria-live="polite"
            >
              Yükleniyor…
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );
}
