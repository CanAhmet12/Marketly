/**
 * Ortam değişkenlerini okur. İstemci tarafında yalnızca NEXT_PUBLIC_* kullanılır.
 */
export function getSupabasePublicEnv() {
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(),
    anonKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim(),
  };
}

export function getApiBaseEnv() {
  return process.env.NEXT_PUBLIC_API_BASE ?? "";
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabasePublicEnv();
  return Boolean(url && anonKey);
}

/** OG / metadataBase için mutlak site kökü (isteğe bağlı) */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
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
