import type { SupabaseClient } from "@supabase/supabase-js";

import type { FeedPost } from "@/features/feed/types";
import type { RecommendedCreatorCard } from "@/features/home/types";
import type { DiscoverSignalCardRow } from "@/features/signals/repository/types";
import { normalizeSignalConfidence } from "@/features/signals/lib/normalize-signal-confidence";

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

function mapRecommendedCreator(row: LeaderboardRpcRow): RecommendedCreatorCard {
  const bio = "";
  return {
    id: row.id,
    name: row.full_name?.trim() || row.username?.trim() || "Üretici",
    handle: `@${row.username ?? "user"}`,
    avatar_url: row.avatar_url ?? null,
    bio: null,
    verified: Boolean(row.verified),
    tier: row.tier ?? "free",
    follower_count: row.follower_count ?? 0,
    expertise: bio || "Piyasa ve teknik akış",
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
    const rows = (Array.isArray(data) ? data : []) as LeaderboardRpcRow[];
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
    const rows = (Array.isArray(data) ? data : []) as Record<string, unknown>[];
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

/** `posts` type=live → canlı yayın gönderileri */
export async function fetchLiveNowPosts(
  client: SupabaseClient,
  limit = 8,
): Promise<FeedPost[]> {
  try {
    const { data, error } = await client
      .from("posts")
      .select(
        "id, user_id, type, title, content, thumbnail_url, image_url, video_url, created_at, views_count, likes_count, comments_count",
      )
      .eq("type", "live")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((p: Record<string, unknown>): FeedPost => ({
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
      asset_tag: null,
      author_name: "Kullanıcı",
      author_handle: "@user",
      author_avatar: null,
      author_tier: "free",
      is_liked: false,
      is_saved: false,
      media_urls: null,
      mentioned_users: null,
      link_preview: null,
      quoted_post_id: null,
      quoted_post: null,
    }));
  } catch (e) {
    console.warn("[home] fetchLiveNowPosts", e);
    return [];
  }
}
