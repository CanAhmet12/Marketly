import type { AuthUser, Profile } from "@/lib/supabase/types";

import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";

/** Mock modda otomatik giriş: bu profil kimliği auth `user.id` ile eşlenir (`/channel/{id}`). */
export const MOCK_APP_VIEWER_PROFILE_ID = "mock-profile-01";

function tierFromMock(t: string): Profile["tier"] {
  if (t === "elite" || t === "pro" || t === "free") return t;
  return "free";
}

export function getMockAppViewerProfile(): Profile {
  const row = MOCK_PROFILE_BY_ID[MOCK_APP_VIEWER_PROFILE_ID];
  if (!row) {
    throw new Error("[mock/authentication] MOCK_APP_VIEWER_PROFILE_ID fixtures’ta yok.");
  }
  return {
    id: row.id,
    username: row.username,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    cover_url: row.cover_url,
    bio: row.bio,
    tier: tierFromMock(row.tier),
    verified: row.verified,
    created_at: row.created_at,
  };
}

export function getMockAppViewerUser(): AuthUser {
  const p = getMockAppViewerProfile();
  return {
    id: p.id,
    email: "demo.viewer@marketly.mock",
    displayName: p.full_name ?? p.username ?? "Demo izleyici",
    username: p.username,
    avatarUrl: p.avatar_url,
    tier: p.tier ?? undefined,
    verified: p.verified,
  };
}
