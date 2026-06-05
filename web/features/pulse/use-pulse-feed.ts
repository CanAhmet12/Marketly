"use client";

import { useMemo } from "react";

import { isPulsePost } from "@/features/feed/feed-display";
import { useDiscoverFeed } from "@/features/feed/use-discover-feed";

export function usePulseFeedQueue(currentId: string) {
  const { posts, query } = useDiscoverFeed();

  const pulsePosts = useMemo(() => posts.filter(isPulsePost), [posts]);

  const startIndex = useMemo(() => {
    const idx = pulsePosts.findIndex((p) => p.id === currentId);
    return idx >= 0 ? idx : 0;
  }, [pulsePosts, currentId]);

  const ordered = useMemo(() => {
    if (!pulsePosts.length) return [];
    if (startIndex <= 0) return pulsePosts;
    return [...pulsePosts.slice(startIndex), ...pulsePosts.slice(0, startIndex)];
  }, [pulsePosts, startIndex]);

  return {
    posts: ordered,
    allPulsePosts: pulsePosts,
    startIndex,
    isLoading: query.isPending && !query.data,
    isError: query.isError,
    refetch: query.refetch,
  };
}
