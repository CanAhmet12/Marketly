import type { QueryClient, InfiniteData } from "@tanstack/react-query";

import type { FeedPageResult } from "@/features/feed/types";
import type { SearchResultBundle } from "@/features/search/types";

function patchInfiniteFeedPosts(
  old: InfiniteData<FeedPageResult> | undefined,
  postId: string,
  mapPost: (post: FeedPageResult["posts"][number]) => FeedPageResult["posts"][number],
): InfiniteData<FeedPageResult> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: page.posts.map((p) => (p.id !== postId ? p : mapPost(p))),
    })),
  };
}

export function patchAllFeedLike(qc: QueryClient, postId: string, currentlyLiked: boolean) {
  qc.setQueriesData<InfiniteData<FeedPageResult>>(
    {
      predicate: (q) =>
        Array.isArray(q.queryKey) && (q.queryKey[0] === "home-feed" || q.queryKey[0] === "discover-feed"),
    },
    (old) =>
      patchInfiniteFeedPosts(old, postId, (p) => ({
        ...p,
        is_liked: !currentlyLiked,
        likes: Math.max(0, p.likes + (currentlyLiked ? -1 : 1)),
      })),
  );
}

export function patchAllFeedSave(qc: QueryClient, postId: string, currentlySaved: boolean) {
  qc.setQueriesData<InfiniteData<FeedPageResult>>(
    {
      predicate: (q) =>
        Array.isArray(q.queryKey) && (q.queryKey[0] === "home-feed" || q.queryKey[0] === "discover-feed"),
    },
    (old) =>
      patchInfiniteFeedPosts(old, postId, (p) => ({
        ...p,
        is_saved: !currentlySaved,
      })),
  );
}

export function patchGlobalSearchLike(qc: QueryClient, postId: string, currentlyLiked: boolean) {
  qc.setQueriesData<SearchResultBundle>(
    { predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "global-search" },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        posts: old.posts.map((p) =>
          p.id !== postId
            ? p
            : { ...p, likes: Math.max(0, p.likes + (currentlyLiked ? -1 : 1)) },
        ),
      };
    },
  );
}
