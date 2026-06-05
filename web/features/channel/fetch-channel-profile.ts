import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChannelProfile } from "./types";
import { isMockDataEnabled } from "@/mock/config";
import { mockChannelProfile } from "@/mock/adapters/channel";

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** `profiles` tek satır — mobil `useProfile` select listesi ile uyumlu; eksik kolonlar 0/null */
export async function fetchChannelProfile(
  client: SupabaseClient,
  userId: string,
): Promise<ChannelProfile | null> {
  if (isMockDataEnabled()) {
    return mockChannelProfile(userId);
  }

  const { data, error } = await client
    .from("profiles")
    .select(
      `
      id,
      username,
      full_name,
      avatar_url,
      cover_url,
      bio,
      verified,
      tier,
      follower_count,
      following_count,
      signal_accuracy,
      streak_days,
      marketcoin,
      subscriber_count,
      subscription_price,
      created_at,
      updated_at
    `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42703" || error.message.includes("column")) {
      console.warn("[channel] profiles kolon eksik, minimal select deneniyor", error.message);
      return fetchChannelProfileMinimal(client, userId);
    }
    console.warn("[channel] fetchChannelProfile", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as Record<string, unknown>;
  return {
    id: str(row.id) || userId,
    username: str(row.username) || "user",
    full_name: row.full_name != null ? String(row.full_name) : null,
    avatar_url: row.avatar_url != null ? String(row.avatar_url) : null,
    cover_url: row.cover_url != null ? String(row.cover_url) : null,
    bio: row.bio != null ? String(row.bio) : null,
    verified: Boolean(row.verified),
    tier: str(row.tier) || "free",
    follower_count: num(row.follower_count),
    following_count: num(row.following_count),
    signal_accuracy: row.signal_accuracy == null ? null : num(row.signal_accuracy),
    streak_days: num(row.streak_days),
    marketcoin: num(row.marketcoin),
    subscriber_count: num(row.subscriber_count),
    subscription_price: row.subscription_price == null ? null : num(row.subscription_price),
    created_at: str(row.created_at) || new Date().toISOString(),
    updated_at: row.updated_at != null ? String(row.updated_at) : null,
  };
}

async function fetchChannelProfileMinimal(
  client: SupabaseClient,
  userId: string,
): Promise<ChannelProfile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, username, full_name, avatar_url, cover_url, bio, verified, tier, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) {
    console.warn("[channel] fetchChannelProfileMinimal", error?.message);
    return null;
  }
  const row = data as Record<string, unknown>;
  return {
    id: str(row.id) || userId,
    username: str(row.username) || "user",
    full_name: row.full_name != null ? String(row.full_name) : null,
    avatar_url: row.avatar_url != null ? String(row.avatar_url) : null,
    cover_url: row.cover_url != null ? String(row.cover_url) : null,
    bio: row.bio != null ? String(row.bio) : null,
    verified: Boolean(row.verified),
    tier: str(row.tier) || "free",
    follower_count: 0,
    following_count: 0,
    signal_accuracy: null,
    streak_days: 0,
    marketcoin: 0,
    subscriber_count: 0,
    subscription_price: null,
    created_at: str(row.created_at) || new Date().toISOString(),
    updated_at: row.updated_at != null ? String(row.updated_at) : null,
  };
}
