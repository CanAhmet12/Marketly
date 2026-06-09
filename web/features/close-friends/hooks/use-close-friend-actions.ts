"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addCloseFriend,
  addCloseFriendMock,
  removeCloseFriend,
  removeCloseFriendMock,
} from "@/features/close-friends/lib/close-friends-persistence";
import { queryKeys } from "@/lib/query-keys";

type Args = { userId: string; friendId: string };

export function useCloseFriendActions(mockOn: boolean) {
  const qc = useQueryClient();

  const invalidate = (viewerId: string, friendId?: string) => {
    void qc.invalidateQueries({ queryKey: ["close-friends-hub", viewerId] });
    void qc.invalidateQueries({ queryKey: ["close-friends-candidates", viewerId] });
    if (friendId) {
      for (const circleId of [`${friendId}::close_followers`, `${friendId}::creator_selected`]) {
        void qc.invalidateQueries({ queryKey: queryKeys.closeFriendsCircle(circleId, viewerId) });
      }
    }
  };

  const add = useMutation({
    mutationFn: async ({ userId, friendId }: Args) => {
      const res = mockOn ? await addCloseFriendMock(userId, friendId) : await addCloseFriend(userId, friendId);
      if (!res.ok) throw new Error(res.error);
    },
    onSuccess: (_d, vars) => invalidate(vars.userId, vars.friendId),
  });

  const remove = useMutation({
    mutationFn: async ({ userId, friendId }: Args) => {
      const res = mockOn ? await removeCloseFriendMock(userId, friendId) : await removeCloseFriend(userId, friendId);
      if (!res.ok) throw new Error(res.error);
    },
    onSuccess: (_d, vars) => invalidate(vars.userId, vars.friendId),
  });

  return {
    addCloseFriend: add.mutateAsync,
    removeCloseFriend: remove.mutateAsync,
    isSubmitting: add.isPending || remove.isPending,
    error: add.error?.message ?? remove.error?.message ?? null,
    clearError: () => {
      add.reset();
      remove.reset();
    },
  };
}
