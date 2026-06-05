import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { AuthUser, Profile } from "@/lib/supabase/types";

const PROFILE_SELECT_FULL =
  "id, username, full_name, avatar_url, cover_url, bio, tier, verified, created_at" as const;
const PROFILE_SELECT_MIN = "id, username, full_name, avatar_url, tier, verified, created_at" as const;

async function fetchProfileRow(client: SupabaseClient, userId: string): Promise<{ row: Profile | null }> {
  const full = await client.from("profiles").select(PROFILE_SELECT_FULL).eq("id", userId).maybeSingle();
  if (!full.error && full.data) {
    return { row: full.data as Profile };
  }
  const missCol =
    full.error?.code === "42703" ||
    (Boolean(full.error?.message?.includes("column")) && Boolean(full.error?.message?.includes("does not exist")));
  if (missCol) {
    const min = await client.from("profiles").select(PROFILE_SELECT_MIN).eq("id", userId).maybeSingle();
    if (!min.error && min.data) {
      const d = min.data as Record<string, unknown>;
      return {
        row: {
          id: String(d.id),
          username: (d.username as string | null) ?? null,
          full_name: (d.full_name as string | null) ?? null,
          avatar_url: (d.avatar_url as string | null) ?? null,
          cover_url: null,
          bio: null,
          tier: (d.tier as Profile["tier"]) ?? null,
          verified: Boolean(d.verified),
          created_at: String(d.created_at ?? ""),
        },
      };
    }
  }
  return { row: null };
}

function emailLocalPart(email: string): string {
  return (email.split("@")[0] ?? "user").replace(/[^a-zA-Z0-9_]/g, "") || "user";
}

function generateUsernameSuffix(): string {
  return (Date.now() % 100000).toString().padStart(5, "0").slice(-4);
}

function generateReferralCode(): string {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).toUpperCase().slice(0, 8);
}

function profileToDisplayUser(profile: Profile, email: string): AuthUser {
  return {
    id: profile.id,
    email,
    displayName: profile.full_name?.trim() || profile.username || emailLocalPart(email),
    username: profile.username,
    avatarUrl: profile.avatar_url ?? undefined,
    tier: profile.tier ?? undefined,
    verified: profile.verified,
  };
}

/**
 * Mobil `AuthContext.loadProfile` ile aynı strateji:
 * 1) `profiles` satırı var mı bak
 * 2) Yoksa `create_profile_if_not_exists` RPC
 * 3) İsteğe bağlı `update_user_streak` (sessiz)
 *
 * Doğrudan `profiles` INSERT/UPSERT yapılmaz.
 */
export async function loadUserProfile(
  client: SupabaseClient,
  userId: string,
  email: string,
  authUser?: User | null,
): Promise<{ profile: Profile | null; displayUser: AuthUser | null }> {
  const { row } = await fetchProfileRow(client, userId);
  if (row) {
    await silentStreak(client, userId);
    return { profile: row, displayUser: profileToDisplayUser(row, email) };
  }

  const meta = (authUser?.user_metadata ?? {}) as Record<string, unknown>;
  const usernameMeta = meta.username;
  const fullNameMeta = meta.full_name;

  const emailPrefix = emailLocalPart(email);
  const username =
    typeof usernameMeta === "string" && usernameMeta.trim().length > 0
      ? usernameMeta
          .trim()
          .replace(/[^a-zA-Z0-9_]/g, "")
          .slice(0, 32) || `${emailPrefix}${generateUsernameSuffix()}`
      : `${emailPrefix}${generateUsernameSuffix()}`;
  const fullName =
    typeof fullNameMeta === "string" && fullNameMeta.trim().length > 0
      ? fullNameMeta.trim()
      : emailPrefix || "Kullanıcı";

  const referralCode = generateReferralCode();

  // P0-005: Auth temel hak — write-gate istisnası.
  // create_profile_if_not_exists, kullanıcı kaydının zorunlu parçasıdır;
  // write-gate kapsamı dışında tutulur (WEB register'ın çalışması için şart).
  const { data: rpcData, error: rpcError } = await client.rpc("create_profile_if_not_exists", {
    p_user_id: userId,
    p_username: username,
    p_full_name: fullName,
    p_referral_code: referralCode,
  });

  if (!rpcError && rpcData) {
    const p = rpcData as Profile;
    await silentStreak(client, userId);
    return { profile: p, displayUser: profileToDisplayUser(p, email) };
  }

  return {
    profile: null,
    displayUser: {
      id: userId,
      email,
      displayName: emailPrefix || email.split("@")[0] || "Kullanıcı",
    } satisfies AuthUser,
  };
}

async function silentStreak(client: SupabaseClient, userId: string) {
  // P0-005: streak güncellemesi de auth temel akışı — write-gate istisnası.
  try {
    await client.rpc("update_user_streak", { p_user_id: userId });
  } catch {
    /* sessiz */
  }
}

/** Kayıt öncesi kullanıcı adı üretimi (mobil register ile uyumlu) */
export function suggestUsernameFromEmail(email: string): string {
  const emailPrefix = emailLocalPart(email.toLowerCase());
  return `${emailPrefix || "user"}${generateUsernameSuffix()}`;
}

export function buildSignUpMetadata(displayName: string, email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const username = suggestUsernameFromEmail(cleanEmail);
  return {
    username,
    full_name: displayName.trim(),
  };
}
