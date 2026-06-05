"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { FollowState } from "@/features/channel/types";
import { deleteFollow, fetchFollowState, insertFollow } from "@/features/channel/fetch-follow";
import { useAuth } from "@/features/auth/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { isMockDataEnabled } from "@/mock/config";
import { mockFollowState } from "@/mock/adapters/channel";
import { mockIsFollowingCreator, mockToggleCreatorFollow } from "@/mock/adapters/creator-follow-store";
import { getMockFollowingCreatorIds } from "@/mock/fixtures/follows";

export function useCreatorFollowAction(creatorId: string) {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const viewerId = user?.id ?? null;

  const followQuery = useQuery({
    queryKey: queryKeys.channelFollow(creatorId, viewerId),
    queryFn: async () => {
      if (isMockDataEnabled()) {
        const base = mockFollowState(creatorId);
        const defaultFollowing = getMockFollowingCreatorIds(viewerId);
        return {
          ...base,
          isFollowing: mockIsFollowingCreator(creatorId, viewerId, defaultFollowing),
        };
      }
      return fetchFollowState(getSupabaseBrowserClient(), viewerId, creatorId);
    },
  });

  const follow = followQuery.data ?? { isFollowing: false, followersCount: 0, followingCount: 0 };

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      if (!viewerId) throw new Error("login");
      if (isMockDataEnabled()) {
        mockToggleCreatorFollow(creatorId, next);
        return;
      }
      const c = getSupabaseBrowserClient();
      if (next) {
        const r = await insertFollow(c, viewerId, creatorId);
        if (!r.ok) throw new Error(r.error ?? "follow");
      } else {
        const r = await deleteFollow(c, viewerId, creatorId);
        if (!r.ok) throw new Error(r.error ?? "unfollow");
      }
    },
    onMutate: async (nextFollowing: boolean) => {
      await qc.cancelQueries({ queryKey: queryKeys.channelFollow(creatorId, viewerId) });
      const prev = qc.getQueryData<FollowState>(queryKeys.channelFollow(creatorId, viewerId));
      qc.setQueryData<FollowState>(queryKeys.channelFollow(creatorId, viewerId), (old) => {
        const o = old ?? { isFollowing: false, followersCount: 0, followingCount: 0 };
        const delta = nextFollowing && !o.isFollowing ? 1 : !nextFollowing && o.isFollowing ? -1 : 0;
        return { ...o, isFollowing: nextFollowing, followersCount: Math.max(0, o.followersCount + delta) };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.channelFollow(creatorId, viewerId), ctx.prev);
    },
    onSettled: () => {
      if (!isMockDataEnabled()) {
        void qc.invalidateQueries({ queryKey: queryKeys.channelFollowByChannel(creatorId) });
      }
    },
  });

  const toggle = useCallback(() => {
    if (!viewerId) {
      router.push(`/auth/login?next=${encodeURIComponent("/creators")}`);
      return;
    }
    void mutation.mutateAsync(!follow.isFollowing);
  }, [viewerId, mutation, follow.isFollowing, router]);

  return {
    isFollowing: follow.isFollowing,
    followersCount: follow.followersCount,
    isPending: mutation.isPending,
    toggle,
  };
}
