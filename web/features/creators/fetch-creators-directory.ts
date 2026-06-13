import type { SupabaseClient } from "@supabase/supabase-js";

import { buildCreatorsDirectoryPayload } from "@/features/creators/lib/build-creators-directory-payload";
import {
  type CreatorsDirectoryRpcRow,
  mapCreatorsDirectoryRpcRow,
} from "@/features/creators/lib/map-creator-directory-rpc-row";
import {
  enrichCreatorFromPosts,
  mapRecommendedToDirectoryRow,
} from "@/features/creators/lib/map-creator-directory-row";
import type { CreatorsSortId } from "@/features/creators/lib/creators-directory-config";
import { mapCreatorsSortToRpc } from "@/features/creators/lib/creators-directory-config";
import type { CreatorDirectoryPayload, CreatorDirectoryRow } from "@/features/creators/types";
import { fetchDiscoverFeedPage } from "@/features/feed/fetch-home-feed";
import { filterDiscoverPosts } from "@/features/feed/discover-feed-filters";
import { fetchLiveNowPosts, fetchRecommendedCreators } from "@/features/home/fetch-home-extras";
import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";

async function fetchCreatorsDirectoryFromRpc(
  client: SupabaseClient,
  limit: number,
  sort = "recommended",
): Promise<CreatorDirectoryRow[] | null> {
  try {
    const { data, error } = await client.rpc("get_creators_directory", {
      p_limit: limit,
      p_sort: sort,
    });
    if (error) {
      console.warn("[creators] get_creators_directory", error.message);
      return null;
    }
    const rows = parseRpcRows<CreatorsDirectoryRpcRow>(data);
    if (rows.length === 0) return null;
    return rows.map(mapCreatorsDirectoryRpcRow);
  } catch (e) {
    console.warn("[creators] fetchCreatorsDirectoryFromRpc", e);
    return null;
  }
}

/** Supabase — `get_creators_directory` RPC; yoksa leaderboard + keşfet fallback */
export async function fetchCreatorsDirectory(
  client: SupabaseClient,
  userId: string | null,
  sort: CreatorsSortId = "recommended",
): Promise<CreatorDirectoryPayload> {
  const rpcRows = await fetchCreatorsDirectoryFromRpc(client, 48, mapCreatorsSortToRpc(sort));
  if (rpcRows && rpcRows.length > 0) {
    return buildCreatorsDirectoryPayload(rpcRows);
  }

  const [recommended, livePosts, feedPage] = await Promise.all([
    fetchRecommendedCreators(client, 48),
    fetchLiveNowPosts(client, 16),
    fetchDiscoverFeedPage(client, 0, userId),
  ]);

  const posts = feedPage.posts;
  const creatorPosts = filterDiscoverPosts(posts, "creators");

  const rows = recommended.map((c) => {
    const enrich = enrichCreatorFromPosts(c.id, [...posts, ...livePosts]);
    if (!enrich.isLive && livePosts.some((p) => p.user_id === c.id)) {
      const lp = livePosts.find((p) => p.user_id === c.id)!;
      enrich.isLive = true;
      enrich.liveHref = `/live/${lp.id}`;
    }
    return mapRecommendedToDirectoryRow(c, enrich);
  });

  if (rows.length > 0) {
    return buildCreatorsDirectoryPayload(rows);
  }

  /** RPC boş — keşfet havuzundan yazar başına bir satır */
  const fallbackRows = creatorPosts.map((p) => {
    const enrich = enrichCreatorFromPosts(p.user_id, posts);
    return mapRecommendedToDirectoryRow(
      {
        id: p.user_id,
        name: p.author_name || "Üretici",
        handle: p.author_handle || `@user`,
        avatar_url: p.author_avatar,
        bio: null,
        verified: false,
        tier: p.author_tier ?? "free",
        follower_count: p.likes * 12 + p.comments * 8,
        expertise: p.asset_tag ?? "Piyasa analizi",
        signal_count: 0,
        signal_accuracy: null,
      },
      enrich,
    );
  });

  return buildCreatorsDirectoryPayload(fallbackRows);
}
