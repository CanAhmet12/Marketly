import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { clientLog } from "@/lib/observability/logger";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient | null = null;
let browserClientEnvFingerprint: string | null = null;

function supabaseBrowserEnvFingerprint(): string {
  const { url, anonKey } = getSupabasePublicEnv();
  return `${url}\0${anonKey}`;
}

/**
 * Tarayıcıda kullanılacak Supabase istemcisi.
 * Yalnızca Client Component veya tarayıcı etkinliklerinde çağırın.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, anonKey } = getSupabasePublicEnv();

  if (!url || !anonKey) {
    if (typeof window !== "undefined") {
      clientLog("error", "supabase:browser-create", "NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.");
    }
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Tekil tarayıcı örneği (singleton).
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient yalnızca tarayıcıda kullanılmalıdır. Sunucu bileşenlerinde kullanmayın.",
    );
  }
  const fp = supabaseBrowserEnvFingerprint();
  if (!browserClient || fp !== browserClientEnvFingerprint) {
    browserClient = createSupabaseBrowserClient();
    browserClientEnvFingerprint = fp;
  }
  return browserClient;
}
