import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchPortfolioHoldings } from "@/features/markets/fetch-portfolio-holdings";
import { fetchWatchlistFromDb } from "@/features/markets/fetch-watchlist";
import { fetchMarketAssets } from "@/features/markets/fetch-market-assets";

import { mergeAffinityContexts } from "./domain/affinity-merge";
import { buildAffinityContext } from "./domain/personalization-engine";
import type { PersonalizationEvent } from "./domain/personalization-types";
import { fetchUserAffinityProfile } from "./fetch-user-affinity-profile";
import { getServerAffinityCache, setServerAffinityCache } from "./server-affinity-cache";

export type LiveRankContext = {
  followedCreatorIds: ReadonlySet<string>;
  watchedSymbols: ReadonlySet<string>;
  portfolioSymbols: ReadonlySet<string>;
  pulseSymbols: ReadonlySet<string>;
  affinityEvents: readonly PersonalizationEvent[];
  fetchedAt: number;
};

const EMPTY_SET = new Set<string>() as ReadonlySet<string>;

function emptyContext(): LiveRankContext {
  return {
    followedCreatorIds: EMPTY_SET,
    watchedSymbols: EMPTY_SET,
    portfolioSymbols: EMPTY_SET,
    pulseSymbols: EMPTY_SET,
    affinityEvents: [],
    fetchedAt: Date.now(),
  };
}

type LikedPostJoinRow = {
  user_id: string;
  asset_tag: string | null;
  created_at: string;
};

type LikedPostJoin = {
  post_id: string;
  created_at?: string;
  posts?: LikedPostJoinRow | LikedPostJoinRow[] | null;
};

function pickPost(raw: LikedPostJoin["posts"]): LikedPostJoinRow | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

/** Supabase — takip, izleme listesi, beğeni geçmişi → feed sıralama bağlamı */
export async function fetchLiveRankContext(
  client: SupabaseClient,
  userId: string | null,
): Promise<LiveRankContext> {
  const [assets, followsRes, watchlist, portfolio, serverProfile, likesRes] = await Promise.all([
    fetchMarketAssets(client).catch(() => []),
    userId
      ? client.from("follows").select("following_id").eq("follower_id", userId)
      : Promise.resolve({ data: [], error: null }),
    userId ? fetchWatchlistFromDb(client, userId) : Promise.resolve([]),
    userId ? fetchPortfolioHoldings(client, userId).catch(() => []) : Promise.resolve([]),
    userId ? fetchUserAffinityProfile(client, userId).catch(() => null) : Promise.resolve(null),
    userId
      ? client
          .from("post_likes")
          .select(
            `
            post_id,
            created_at,
            posts (
              user_id,
              asset_tag,
              created_at
            )
          `,
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(60)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const pulseSymbols = new Set<string>();
  for (const a of assets) {
    if (Math.abs(a.change_percent) > 0.2) {
      pulseSymbols.add(a.symbol.toUpperCase());
    }
  }
  for (const a of [...assets].sort((x, y) => Math.abs(y.change_percent) - Math.abs(x.change_percent)).slice(0, 6)) {
    pulseSymbols.add(a.symbol.toUpperCase());
  }

  const followedCreatorIds = new Set<string>();
  if (!followsRes.error) {
    for (const row of followsRes.data ?? []) {
      followedCreatorIds.add(String((row as { following_id: string }).following_id));
    }
  }

  const watchedSymbols = new Set(watchlist.map((s) => s.toUpperCase()));

  const portfolioSymbols = new Set<string>();
  for (const h of portfolio) {
    const sym = h.symbol?.trim().toUpperCase();
    if (sym) portfolioSymbols.add(sym);
  }

  setServerAffinityCache(userId, serverProfile);

  const events: PersonalizationEvent[] = [];
  const now = Date.now();

  for (const cid of followedCreatorIds) {
    events.push({
      kind: "creator_view",
      creatorId: cid,
      ts: now - 3600_000,
      quality: 0.75,
    });
  }

  if (!likesRes.error) {
    for (const row of (likesRes.data ?? []) as LikedPostJoin[]) {
      const post = pickPost(row.posts);
      if (!post) continue;
      const ts = row.created_at
        ? new Date(row.created_at).getTime()
        : new Date(post.created_at).getTime();
      events.push({
        kind: "engagement_like",
        creatorId: post.user_id,
        assetSymbol: post.asset_tag?.replace(/^#/, "").trim() || undefined,
        ts: Number.isNaN(ts) ? now : ts,
        quality: 0.88,
      });
      const ast = post.asset_tag?.replace(/^#/, "").trim().toUpperCase();
      if (ast) {
        events.push({
          kind: "asset_view",
          assetSymbol: ast,
          ts: Number.isNaN(ts) ? now : ts,
          quality: 0.7,
        });
      }
    }
  }

  if (!userId && events.length === 0 && pulseSymbols.size === 0) {
    return emptyContext();
  }

  for (const sym of portfolioSymbols) {
    events.push({
      kind: "asset_view",
      assetSymbol: sym,
      ts: now - 1800_000,
      quality: 0.92,
    });
  }

  return {
    followedCreatorIds,
    watchedSymbols,
    portfolioSymbols,
    pulseSymbols,
    affinityEvents: events,
    fetchedAt: Date.now(),
  };
}

/** Sıralama motoru için affinity — sunucu profili + canlı olaylar birleşimi */
export function affinityFromLiveRankContext(ctx: LiveRankContext | null, userId: string | null = null) {
  const serverProfile = userId ? getServerAffinityCache(userId) : null;
  if (!ctx?.affinityEvents.length) {
    return serverProfile?.affinity ?? null;
  }
  const local = buildAffinityContext(ctx.affinityEvents);
  if (!serverProfile?.affinity) return local;
  return mergeAffinityContexts(serverProfile.affinity, local);
}
