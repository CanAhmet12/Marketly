"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { buildSettingsHubFromLive } from "@/features/settings/lib/build-settings-hub-from-live";
import type { AccountControlHubPayload } from "@/features/settings/domain/types";
import { fetchWatchlistFromDb } from "@/features/markets/fetch-watchlist";
import { fetchSavedPosts } from "@/features/social/fetch-saved-posts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Profile } from "@/lib/supabase/types";
import { isMockDataEnabled } from "@/mock/config";

function countNotificationCoverage(notifications: Record<string, unknown> | null) {
  if (!notifications) return { filled: 0, total: 0 };
  const bools = Object.values(notifications).filter((v) => typeof v === "boolean") as boolean[];
  return { filled: bools.filter(Boolean).length, total: bools.length };
}

async function fetchSettingsLiveStats(userId: string, notifications: Record<string, unknown> | null) {
  const client = getSupabaseBrowserClient();
  const [watchlist, savedPosts, followingRes, followersRes, postsRes] = await Promise.all([
    fetchWatchlistFromDb(client, userId),
    fetchSavedPosts(client, userId),
    client.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", userId),
    client.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", userId),
    client.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const notifCoverage = countNotificationCoverage(notifications);
  const notificationFieldsTotal = notifCoverage.total;
  const notificationFieldsFilled = notifCoverage.filled;

  return {
    followingCount: followingRes.count ?? 0,
    followersCount: followersRes.count ?? 0,
    savedCount: savedPosts.length,
    watchlistCount: watchlist.length,
    postsCount: postsRes.count ?? 0,
    hasBio: false,
    hasAvatar: false,
    hasUsername: false,
    notificationFieldsFilled,
    notificationFieldsTotal,
  };
}

export function useSettingsHubLive(
  baseHub: AccountControlHubPayload,
  userId: string | null,
  profile: Profile | null,
  notifications: Record<string, unknown> | null,
) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured() && Boolean(userId);

  const query = useQuery({
    queryKey: ["settings-hub-live", userId],
    queryFn: () => fetchSettingsLiveStats(userId!, notifications),
    enabled: liveMode,
    staleTime: 120_000,
  });

  const hub = useMemo(() => {
    if (mockOn || !liveMode || !query.data) return baseHub;
    const isCreatorSurface = query.data.postsCount > 0;
    return buildSettingsHubFromLive(baseHub, query.data, profile, isCreatorSurface);
  }, [mockOn, liveMode, query.data, baseHub, profile]);

  return { hub, isEnriching: liveMode && query.isLoading };
}
