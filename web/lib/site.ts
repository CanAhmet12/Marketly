/**
 * Marketly kanonik prod domainleri — kod tabanı genelinde referans.
 *
 * Kullanım dağılımı (mevcut kod):
 * - marketly.app  → web, paylaşım linkleri, CORS, API (api.marketly.app)
 * - marketly.io   → bazı mobil ayarlar / portföy paylaşımı (legacy)
 * - marketly.com  → App Store dokümantasyonu (legacy)
 */
export const CANONICAL_WEB_ORIGIN = "https://marketly.app" as const;
export const CANONICAL_API_ORIGIN = "https://api.marketly.app" as const;

/** Auth callback, e-posta redirect, OG canonical için site kökü */
export const CANONICAL_SITE_URL = CANONICAL_WEB_ORIGIN;

/** Supabase Dashboard → Redirect URLs listesine eklenecek callback */
export const AUTH_CALLBACK_PATH = "/auth/callback" as const;

export function authCallbackUrl(siteOrigin: string): string {
  const base = siteOrigin.replace(/\/$/, "");
  return `${base}${AUTH_CALLBACK_PATH}`;
}

/** Supabase URL Configuration için tam redirect listesi */
export const SUPABASE_REDIRECT_URLS = [
  "http://localhost:3000/auth/callback",
  `${CANONICAL_WEB_ORIGIN}/auth/callback`,
] as const;
