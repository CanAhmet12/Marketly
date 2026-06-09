"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  subscribeToCreator,
  unsubscribeFromCreator,
} from "@/features/subscriptions/lib/subscription-persistence";
import { queryKeys } from "@/lib/query-keys";

type Args = {
  userId: string;
  creatorId: string;
  displayName: string;
  tier?: string;
};

export function useMembershipSubscribe() {
  const qc = useQueryClient();

  const invalidate = (creatorId: string, viewerId: string) => {
    void qc.invalidateQueries({ queryKey: queryKeys.membershipHub(viewerId) });
    void qc.invalidateQueries({ queryKey: queryKeys.membershipDetail(creatorId, viewerId) });
  };

  const subscribe = useMutation({
    mutationFn: async ({ userId, creatorId, displayName, tier }: Args) => {
      const res = await subscribeToCreator(userId, creatorId, displayName, tier ?? "premium");
      if (!res.ok) throw new Error(res.error);
    },
    onSuccess: (_d, vars) => invalidate(vars.creatorId, vars.userId),
  });

  const unsubscribe = useMutation({
    mutationFn: async ({ userId, creatorId }: Pick<Args, "userId" | "creatorId">) => {
      const res = await unsubscribeFromCreator(userId, creatorId);
      if (!res.ok) throw new Error(res.error);
    },
    onSuccess: (_d, vars) => invalidate(vars.creatorId, vars.userId),
  });

  return {
    subscribe: subscribe.mutateAsync,
    unsubscribe: unsubscribe.mutateAsync,
    isSubmitting: subscribe.isPending || unsubscribe.isPending,
    error: subscribe.error?.message ?? unsubscribe.error?.message ?? null,
    clearError: () => {
      subscribe.reset();
      unsubscribe.reset();
    },
  };
}
