/**
 * Web auth ve profil UI için gerekli alanlar (mobil `lib/database.types.ts` ile uyumlu).
 * Tek kaynak ileride workspace paketinde olabilir.
 */
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  tier: "free" | "pro" | "elite" | null;
  verified: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  /** Görünen isim — profil.full_name veya e-posta öneki */
  displayName: string;
  username?: string | null;
  avatarUrl?: string | null;
  tier?: Profile["tier"];
  verified?: boolean;
}
