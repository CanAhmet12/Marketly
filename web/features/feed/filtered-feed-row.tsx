"use client";

import { PulseCard } from "@/features/discover/cards/PulseCard";
import { VideoCard } from "@/features/discover/cards/VideoCard";
import { LiveCard } from "@/features/discover/cards/LiveCard";
import { SignalCard } from "@/features/discover/cards/SignalCard";
import { isLivePost, isPulsePost, isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { TextDiscussionCard } from "@/features/home/cards/text-discussion-card";
import { homeHrefForFeedPost } from "@/features/home/routing";

type Props = {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
  index?: number;
  /** Yalnızca Home akışı — premium zaman çizelgesi yüzeyi */
  feedSurface?: "default" | "home";
};

/** Chip filtreli liste: içerik türüne göre kart — CANONICAL Discover cards */
export function FilteredFeedRow({ post, engagement, index = 0, feedSurface = "default" }: Props) {
  if (isSignalPost(post)) {
    return <SignalCard post={post} engagement={engagement} index={index} feedSurface={feedSurface} />;
  }
  if (isPulsePost(post)) {
    return <PulseCard post={post} engagement={engagement} index={index} feedSurface={feedSurface} />;
  }
  if (!isVideoLikePost(post)) {
    return (
      <TextDiscussionCard post={post} href={homeHrefForFeedPost(post)} engagement={engagement} feedSurface={feedSurface} />
    );
  }
  if (isLivePost(post)) {
    return <LiveCard post={post} engagement={engagement} index={index} feedSurface={feedSurface} />;
  }
  // Default: video content
  return <VideoCard post={post} engagement={engagement} index={index} feedSurface={feedSurface} />;
}
