"use client";

import { useCallback } from "react";

import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import type { FeedPost } from "@/features/feed/types";
import type { MarketAssetView } from "@/features/markets/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { homeFeedCardEstimate, useWindowVirtualListVariable } from "@/hooks/use-virtual-list";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

import { HomeFeedDiscoverNudge } from "./home-feed-discover-nudge";
import { HomeFeedLoadFooter } from "./home-feed-load-footer";
import { HomeVisualPostCard } from "./home-visual-post-card";

type Props = {
  posts: FeedPost[];
  engagement: HomeEngagementHandlers;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  assetMap?: Map<string, MarketAssetView> | null;
  /** Sekme değişiminde kart stagger animasyonu */
  tabKey?: string;
};

function renderPostCard(
  post: FeedPost,
  index: number,
  engagement: HomeEngagementHandlers,
  virtualized: boolean,
  assetMap?: Map<string, MarketAssetView> | null,
  tabKey?: string,
) {
  const stripe = index > 0 && index % 2 === 1;
  const tabStagger = Boolean(tabKey);
  const staggerStyle = tabStagger
    ? motionEntranceDelay(index, 55, 6)
    : virtualized
      ? undefined
      : motionEntranceDelay(index);
  return (
    <HomeVisualPostCard
      key={post.id}
      mode="feed"
      post={post}
      lead={index === 0}
      engagement={engagement}
      assetMap={assetMap}
      className={cn(
        "motion-entrance",
        tabStagger && "motion-feed-tab-stagger",
        stripe && "hv-ref-article--stripe",
      )}
      style={staggerStyle}
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
  assetMap,
  tabKey,
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
                {renderPostCard(post, vRow.index, engagement, true, assetMap, tabKey)}
              </div>
            );
          })}
        </div>
      ) : (
        posts.map((post, index) => renderPostCard(post, index, engagement, false, assetMap, tabKey))
      )}

      {hasNextPage ? (
        <>
          <InfiniteScrollSentinel enabled={!isFetchingNextPage} onVisible={loadMore} />
          <HomeFeedLoadFooter loading={isFetchingNextPage} />
        </>
      ) : (
        <>
          <HomeFeedLoadFooter end postCount={posts.length} />
          <HomeFeedDiscoverNudge postCount={posts.length} />
        </>
      )}
    </>
  );
}
