"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchHomeFeedPage } from "@/features/feed/fetch-home-feed";
import type { FeedPost } from "@/features/feed/types";
import { fetchRecommendedCreators, fetchTrendingSignals } from "@/features/home/fetch-home-extras";
import type { RecommendedCreatorCard } from "@/features/home/types";
import { fetchMarketAssets } from "@/features/markets/fetch-market-assets";
import type { MarketAssetView } from "@/features/markets/types";
import { normalizeSignalConfidence } from "@/features/signals/lib/normalize-signal-confidence";
import type { DiscoverSignalCardRow } from "@/features/signals/repository/types";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export type WelcomeLiveData = {
  assets: MarketAssetView[];
  posts: FeedPost[];
  signals: DiscoverSignalCardRow[];
  creators: RecommendedCreatorCard[];
};

async function fetchSignalsAll(client: ReturnType<typeof getSupabaseBrowserClient>, limit = 6) {
  const { data, error } = await client.rpc("get_top_signals", { p_period: "all", p_limit: limit });
  if (error) return fetchTrendingSignals(client, limit);
  const rows = parseRpcRows<Record<string, unknown>>(data);
  return rows.map(
    (r): DiscoverSignalCardRow => ({
      id: String(r.id),
      creator_id: String(r.creator_id ?? ""),
      asset_id: String(r.asset_id ?? ""),
      symbol: String(r.asset_symbol ?? r.asset_id ?? ""),
      direction: (r.direction as DiscoverSignalCardRow["direction"]) ?? "HOLD",
      confidence: normalizeSignalConfidence(typeof r.confidence === "number" ? r.confidence : 3),
      entry_price: r.entry_price != null ? Number(r.entry_price) : null,
      target_price: r.target_price != null ? Number(r.target_price) : null,
      stop_loss: null,
      timeframe: "1G",
      rationale: null,
      is_active: true,
      copies_count: typeof r.copies_count === "number" ? r.copies_count : 0,
      likes_count: typeof r.likes_count === "number" ? r.likes_count : 0,
      created_at: String(r.created_at ?? ""),
      result: null,
      creatorDisplay: String(r.creator_name ?? "Analist"),
      creatorAvatarUrl: null,
    }),
  );
}

async function loadWelcomeLiveData(): Promise<WelcomeLiveData> {
  if (isMockDataEnabled() || !isSupabaseConfigured()) {
    return { assets: [], posts: [], signals: [], creators: [] };
  }
  const client = getSupabaseBrowserClient();
  const [assets, feed, signals, creators] = await Promise.all([
    fetchMarketAssets(client).catch(() => []),
    fetchHomeFeedPage(client, 0, null, "for_you").catch(() => ({ posts: [], hasMore: false })),
    fetchSignalsAll(client, 6).catch(() => []),
    fetchRecommendedCreators(client, 6).catch(() => []),
  ]);
  return {
    assets: assets.slice(0, 8),
    posts: (feed.posts ?? []).slice(0, 3),
    signals: signals.slice(0, 4),
    creators: creators.slice(0, 4),
  };
}

export function useWelcomeLiveData() {
  const mounted = useClientMounted();
  const enabled = mounted && (isMockDataEnabled() || isSupabaseConfigured());

  return useQuery({
    queryKey: ["welcome-live-data"],
    enabled,
    queryFn: loadWelcomeLiveData,
    staleTime: 60_000,
  });
}
