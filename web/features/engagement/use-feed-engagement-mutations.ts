"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { togglePostLike, toggleSavedPost } from "@/features/engagement/post-like-save";
import {
  patchAllFeedLike,
  patchAllFeedSave,
  patchGlobalSearchLike,
} from "@/features/engagement/feed-engagement-cache";
import { persistSavedPostToggle } from "@/features/social/lib/saved-posts-storage";
import { showMutationToast } from "@/lib/ui/mutation-toast";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isMockDataEnabled } from "@/mock/config";

type FeedMutationContext = {
  previousQueries: [QueryKey, unknown][];
};

function snapshotFeedQueries(qc: ReturnType<typeof useQueryClient>): FeedMutationContext {
  return {
    previousQueries: qc.getQueriesData({
      predicate: (q) =>
        Array.isArray(q.queryKey) &&
        (q.queryKey[0] === "home-feed" || q.queryKey[0] === "discover-feed" || q.queryKey[0] === "global-search"),
    }),
  };
}

function restoreFeedQueries(qc: ReturnType<typeof useQueryClient>, ctx: FeedMutationContext | undefined) {
  ctx?.previousQueries.forEach(([key, data]) => {
    qc.setQueryData(key, data);
  });
}

export function useFeedEngagementMutations() {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const qc = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async ({ postId, currentlyLiked }: { postId: string; currentlyLiked: boolean }) => {
      if (!user?.id) throw new Error("Giriş gerekli");
      if (isMockDataEnabled()) return;
      const client = getSupabaseBrowserClient();
      await togglePostLike(client, user.id, postId, currentlyLiked);
    },
    onMutate: async ({ postId, currentlyLiked }) => {
      if (!user?.id) return;
      await qc.cancelQueries({ queryKey: queryKeys.homeFeedAll() });
      const previous = snapshotFeedQueries(qc);
      patchAllFeedLike(qc, postId, currentlyLiked);
      patchGlobalSearchLike(qc, postId, currentlyLiked);
      return previous;
    },
    onError: (_error, _variables, context) => {
      restoreFeedQueries(qc, context);
      showMutationToast("Beğeni kaydedilemedi. Tekrar deneyin.");
    },
    onSuccess: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
    },
  });

  const toggleSave = useMutation({
    mutationFn: async ({ postId, currentlySaved }: { postId: string; currentlySaved: boolean }) => {
      if (!user?.id) throw new Error("Giriş gerekli");
      if (isMockDataEnabled()) {
        persistSavedPostToggle(postId, currentlySaved);
        return;
      }
      const client = getSupabaseBrowserClient();
      await toggleSavedPost(client, user.id, postId, currentlySaved);
    },
    onMutate: async ({ postId, currentlySaved }) => {
      if (!user?.id) return;
      await qc.cancelQueries({ queryKey: queryKeys.homeFeedAll() });
      const previous = snapshotFeedQueries(qc);
      patchAllFeedSave(qc, postId, currentlySaved);
      return previous;
    },
    onError: (_error, _variables, context) => {
      restoreFeedQueries(qc, context);
      showMutationToast("Kaydetme işlemi başarısız. Tekrar deneyin.");
    },
    onSuccess: () => {
      if (isMockDataEnabled()) return;
      void qc.invalidateQueries({ queryKey: queryKeys.homeFeedAll() });
    },
  });

  return { toggleLike, toggleSave, uid, user };
}
