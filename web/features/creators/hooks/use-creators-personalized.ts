"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { useRecommendedCreators } from "@/features/home/hooks/use-recommended-creators";
import { resolveCreatorAvatarUrl } from "@/features/creators/lib/resolve-creator-avatar";
import type { CreatorDirectoryPayload, CreatorDirectoryRow } from "@/features/creators/types";
import { fetchCreatorRecommendations } from "@/features/signals/fetch-signal-recommendations";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

function mapLeaderboardToRow(
  card: {
    id: string;
    name: string;
    handle: string;
    avatar_url: string | null;
    verified: boolean;
    tier: string;
    follower_count: number;
    signal_accuracy?: number | null;
    signal_count?: number;
  },
  existing?: CreatorDirectoryRow,
): CreatorDirectoryRow {
  if (existing) return existing;

  const username = card.handle.replace(/^@/, "") || card.id;
  return {
    id: card.id,
    username,
    displayName: card.name,
    handle: card.handle.startsWith("@") ? card.handle : `@${username}`,
    avatarUrl: resolveCreatorAvatarUrl(card.avatar_url),
    bio: null,
    tier: card.tier,
    verified: card.verified,
    followerCount: card.follower_count,
    signalAccuracy: card.signal_accuracy ?? null,
    specialties: [],
    assetTags: [],
    contentFormats: [],
    formatCounts: {},
    isLive: false,
    liveHref: null,
    latestHeadline: null,
    latestContentHref: null,
    latestThumbnailUrl: null,
    activeSignalsCount: card.signal_count ?? 0,
    bestSignalSymbol: null,
    bestSignalConfidence: null,
    roomHref: null,
    channelHref: `/channel/${encodeURIComponent(card.id)}`,
    editorPick: false,
    rising: false,
    createdAt: new Date().toISOString(),
  };
}

/** Kişiselleştirilmiş üretici önerileri — RPC veya leaderboard fallback */
export function useCreatorsPersonalized(payload: CreatorDirectoryPayload | null) {
  const mounted = useClientMounted();
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const liveMode = mounted && !mockOn && isSupabaseConfigured();
  const { creators: leaderboard, isLoading: leaderboardLoading } = useRecommendedCreators();

  const personalizedQuery = useQuery({
    queryKey: ["creators-personalized", user?.id ?? "anon"],
    queryFn: () => fetchCreatorRecommendations(getSupabaseBrowserClient(), user!.id, 8),
    enabled: liveMode && Boolean(user?.id),
    staleTime: 120_000,
  });

  const byId = useMemo(
    () => new Map((payload?.creators ?? []).map((c) => [c.id, c])),
    [payload?.creators],
  );

  const creators = useMemo(() => {
    const rpcRows = personalizedQuery.data ?? [];
    if (rpcRows.length > 0) {
      return rpcRows
        .map((r) => {
          const existing = byId.get(r.creator_id);
          if (existing) return existing;
          const username = r.username?.trim() || r.creator_id;
          return mapLeaderboardToRow(
            {
              id: r.creator_id,
              name: r.full_name?.trim() || username,
              handle: `@${username}`,
              avatar_url: r.avatar_url,
              verified: false,
              tier: "free",
              follower_count: 0,
              signal_accuracy: null,
            },
            undefined,
          );
        })
        .filter(Boolean) as CreatorDirectoryRow[];
    }

    return leaderboard
      .map((c) => mapLeaderboardToRow(c, byId.get(c.id)))
      .slice(0, 8);
  }, [personalizedQuery.data, leaderboard, byId]);

  const isPersonalized = Boolean(user?.id && (personalizedQuery.data?.length ?? 0) > 0);
  const isLoading =
    liveMode &&
    (personalizedQuery.isLoading || (leaderboardLoading && creators.length === 0));

  return {
    creators,
    isPersonalized,
    isLoading,
    headline: isPersonalized ? "Senin için" : "Öne çıkan analistler",
  };
}
