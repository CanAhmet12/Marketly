"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { fetchPersonalizedDiscussions } from "@/features/social/fetch-personalized-discussions";
import { setDiscussionRecommendationsCache } from "@/features/social/discussion-recommendations-cache";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { AlgoFlags } from "@/lib/algo-flags";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

/** Tartışma önerilerini yükler ve önbelleğe yazar */
export function useDiscussionRecommendations() {
  const { user } = useAuth();
  const mounted = useClientMounted();
  const userId = user?.id ?? null;
  const enabled =
    mounted &&
    !isMockDataEnabled() &&
    isSupabaseConfigured() &&
    AlgoFlags.discussionRecommendations;

  const query = useQuery({
    queryKey: queryKeys.personalizedDiscussions(userId ?? "anon"),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      const pack = await fetchPersonalizedDiscussions(client, userId, 12);
      setDiscussionRecommendationsCache(userId, pack);
      return pack;
    },
    enabled,
    staleTime: 180_000,
  });

  return { rev: query.dataUpdatedAt, isLoading: enabled && query.isLoading, pack: query.data };
}
