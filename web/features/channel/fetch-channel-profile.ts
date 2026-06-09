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

function parseStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const arr = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return arr.length ? arr : null;
}

function mapProfileRow(row: Record<string, unknown>, userId: string): ChannelProfile {
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
    total_views: row.total_views == null ? undefined : num(row.total_views) || null,
    specialties: parseStringArray(row.specialties),
    strategy_style: row.strategy_style != null ? String(row.strategy_style) : null,
    website: row.website != null ? String(row.website) : null,
    location: row.location != null ? String(row.location) : null,
  };
}

async function fetchChannelTotalViews(client: SupabaseClient, userId: string): Promise<number | null> {
  const { data, error } = await client.from("posts").select("views_count").eq("user_id", userId);
  if (error) return null;
  let sum = 0;
  for (const raw of data ?? []) {
    const v = (raw as { views_count?: number }).views_count;
    if (typeof v === "number" && !Number.isNaN(v)) sum += v;
  }
  return sum > 0 ? sum : null;
}

async function enrichChannelProfile(
  client: SupabaseClient,
  profile: ChannelProfile,
): Promise<ChannelProfile> {
  const { data } = await client
    .from("profiles")
    .select("specialties, strategy_style, website, location")
    .eq("id", profile.id)
    .maybeSingle();

  if (data) {
    const row = data as Record<string, unknown>;
    profile.specialties = parseStringArray(row.specialties) ?? profile.specialties;
    profile.strategy_style = row.strategy_style != null ? String(row.strategy_style) : profile.strategy_style;
    profile.website = row.website != null ? String(row.website) : profile.website;
    profile.location = row.location != null ? String(row.location) : profile.location;
  }

  if (profile.total_views == null) {
    const views = await fetchChannelTotalViews(client, profile.id);
    if (views != null) profile.total_views = views;
  }

  return profile;
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
      updated_at,
      specialties,
      strategy_style,
      website,
      location
    `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42703" || error.message.includes("column")) {
      console.warn("[channel] profiles kolon eksik, minimal select deneniyor", error.message);
      const minimal = await fetchChannelProfileMinimal(client, userId);
      return minimal ? enrichChannelProfile(client, minimal) : null;
    }
    console.warn("[channel] fetchChannelProfile", error.message);
    return null;
  }
  if (!data) return null;

  const profile = mapProfileRow(data as Record<string, unknown>, userId);
  return enrichChannelProfile(client, profile);
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
  return mapProfileRow(data as Record<string, unknown>, userId);
}
