/**
 * Ortam değişkenlerini okur. İstemci tarafında yalnızca NEXT_PUBLIC_* kullanılır.
 * Geliştirmede kök `.env` içindeki EXPO_PUBLIC_* değerlerine fallback yapılır.
 */
import { CANONICAL_SITE_URL } from "@/lib/site";
export function getSupabasePublicEnv() {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    ""
  ).trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON ??
    ""
  ).trim();
  return { url, anonKey };
}

export function getApiBaseEnv() {
  return process.env.NEXT_PUBLIC_API_BASE ?? "";
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabasePublicEnv();
  return Boolean(url && anonKey);
}

/** OG / metadataBase / auth redirect için mutlak site kökü */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  if (process.env.NODE_ENV === "production") return CANONICAL_SITE_URL;
  return "";
}

/** Geliştirme sırasında eksik env uyarısı */
export function getSupabaseEnvIssues(): string[] {
  const { url, anonKey } = getSupabasePublicEnv();
  const issues: string[] = [];
  if (!url.trim()) issues.push("NEXT_PUBLIC_SUPABASE_URL tanımlı değil.");
  if (!anonKey.trim()) issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.");
  return issues;
}
