import type { SupabaseClient } from "@supabase/supabase-js";

import type { FeedPost } from "@/features/feed/types";
import type { RecommendedCreatorCard } from "@/features/home/types";
import type { HomeVisualRailLink } from "@/features/home/visual/mock-data";
import type { DiscoverSignalCardRow } from "@/features/signals/repository/types";
import { normalizeSignalConfidence } from "@/features/signals/lib/normalize-signal-confidence";
import { readPostComments, readPostLikes } from "@/features/feed/post-count-fields";
import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";

type LeaderboardRpcRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  tier: string | null;
  verified: boolean | null;
  signal_accuracy: number | null;
  follower_count: number | null;
  signal_count: number | null;
};

function formatCreatorExpertise(row: LeaderboardRpcRow): string {
  const parts: string[] = [];
  const accuracy = row.signal_accuracy ?? 0;
  const count = row.signal_count ?? 0;
  if (accuracy > 0) parts.push(`%${Math.round(accuracy)} isabet`);
  if (count > 0) parts.push(`${count} sinyal`);
  return parts.length > 0 ? parts.join(" · ") : "Piyasa ve teknik akış";
}

function mapRecommendedCreator(row: LeaderboardRpcRow): RecommendedCreatorCard {
  return {
    id: row.id,
    name: row.full_name?.trim() || row.username?.trim() || "Üretici",
    handle: `@${row.username ?? "user"}`,
    avatar_url: row.avatar_url ?? null,
    bio: null,
    verified: Boolean(row.verified),
    tier: row.tier ?? "free",
    follower_count: row.follower_count ?? 0,
    expertise: formatCreatorExpertise(row),
    signal_count: row.signal_count ?? 0,
    signal_accuracy: row.signal_accuracy ?? null,
  };
}

/** `get_leaderboard_analysts` RPC → önerilen üreticiler */
export async function fetchRecommendedCreators(
  client: SupabaseClient,
  limit = 12,
): Promise<RecommendedCreatorCard[]> {
  try {
    const { data, error } = await client.rpc("get_leaderboard_analysts", { p_limit: limit });
    if (error) {
      console.warn("[home] get_leaderboard_analysts", error.message);
      return [];
    }
    const rows = parseRpcRows<LeaderboardRpcRow>(data);
    return rows.map(mapRecommendedCreator);
  } catch (e) {
    console.warn("[home] fetchRecommendedCreators", e);
    return [];
  }
}

/** `get_top_signals` RPC → trending signal kartları */
export async function fetchTrendingSignals(
  client: SupabaseClient,
  limit = 12,
): Promise<DiscoverSignalCardRow[]> {
  try {
    const { data, error } = await client.rpc("get_top_signals", { p_period: "weekly", p_limit: limit });
    if (error) {
      console.warn("[home] get_top_signals", error.message);
      return [];
    }
    const rows = parseRpcRows<Record<string, unknown>>(data);
    return rows.map((r) => ({
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
    }));
  } catch (e) {
    console.warn("[home] fetchTrendingSignals", e);
    return [];
  }
}

function formatTopicViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M görüntülenme`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")}b görüntülenme`;
  return `${n} görüntülenme`;
}

type TrendingPostRow = Record<string, unknown> & {
  asset_tag: string | null;
};

/** `posts.asset_tag` frekansı → trend konular (sağ rail) */
export async function fetchTrendingTopicsFromPosts(
  client: SupabaseClient,
  limit = 5,
): Promise<HomeVisualRailLink[]> {
  try {
    const { data, error } = await client
      .from("posts")
      .select("asset_tag, views_count, likes, comments, likes_count, comments_count")
      .not("asset_tag", "is", null)
      .order("created_at", { ascending: false })
      .limit(300);

    if (error || !data?.length) return [];

    const agg = new Map<string, { views: number; posts: number; engagement: number }>();
    for (const row of data as TrendingPostRow[]) {
      const tag = row.asset_tag?.replace(/^#/, "").trim();
      if (!tag) continue;
      const key = tag.toUpperCase();
      const cur = agg.get(key) ?? { views: 0, posts: 0, engagement: 0 };
      cur.views += typeof row.views_count === "number" ? row.views_count : 0;
      cur.posts += 1;
      cur.engagement += readPostComments(row) + readPostLikes(row);
      agg.set(key, cur);
    }

    return [...agg.entries()]
      .sort((a, b) => b[1].engagement + b[1].views * 0.1 - (a[1].engagement + a[1].views * 0.1))
      .slice(0, limit)
      .map(([tag, stats], i) => ({
        label: `#${tag}`,
        meta: formatTopicViews(stats.views),
        rank: i + 1,
        href: `/discover?q=${encodeURIComponent(tag)}`,
        trendDelta: stats.posts > 1 ? `${stats.posts} gönderi` : undefined,
        trendDeltaAccent: "up" as const,
      }));
  } catch (e) {
    console.warn("[home] fetchTrendingTopicsFromPosts", e);
    return [];
  }
}

/** `posts` type=live → canlı yayın gönderileri */
export async function fetchLiveNowPosts(
  client: SupabaseClient,
  limit = 8,
): Promise<FeedPost[]> {
  try {
    const { data, error } = await client
      .from("posts")
      .select(
        `id, user_id, type, title, content, thumbnail_url, image_url, video_url, created_at, views_count, likes_count, comments_count, asset_tag,
        profiles!posts_user_id_fkey ( username, full_name, avatar_url, tier )`,
      )
      .eq("type", "live")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((p: Record<string, unknown>): FeedPost => {
      const rawProfile = p.profiles;
      const prof = Array.isArray(rawProfile)
        ? (rawProfile[0] as Record<string, unknown> | undefined)
        : (rawProfile as Record<string, unknown> | null);
      const username = prof?.username != null ? String(prof.username) : "user";
      const fullName = prof?.full_name != null ? String(prof.full_name).trim() : "";

      return {
        id: String(p.id),
        user_id: String(p.user_id),
        type: "live",
        title: p.title != null ? String(p.title) : null,
        content: p.content != null ? String(p.content) : "",
        thumbnail_url: p.thumbnail_url != null ? String(p.thumbnail_url) : null,
        image_url: p.image_url != null ? String(p.image_url) : null,
        video_url: p.video_url != null ? String(p.video_url) : null,
        created_at: String(p.created_at ?? ""),
        likes: typeof p.likes_count === "number" ? p.likes_count : 0,
        comments: typeof p.comments_count === "number" ? p.comments_count : 0,
        views_count: typeof p.views_count === "number" ? p.views_count : 0,
        asset_tag: p.asset_tag != null ? String(p.asset_tag) : null,
        author_name: fullName || username,
        author_handle: `@${username}`,
        author_avatar: prof?.avatar_url != null ? String(prof.avatar_url) : null,
        author_tier: prof?.tier != null ? String(prof.tier) : "free",
        is_liked: false,
        is_saved: false,
        media_urls: null,
        mentioned_users: null,
        link_preview: null,
        quoted_post_id: null,
        quoted_post: null,
      };
    });
  } catch (e) {
    console.warn("[home] fetchLiveNowPosts", e);
    return [];
  }
}
