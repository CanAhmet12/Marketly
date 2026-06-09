import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { clientLog } from "@/lib/observability/logger";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient | null = null;
let browserClientEnvFingerprint: string | null = null;

function supabaseBrowserEnvFingerprint(): string {
  const { url, anonKey } = getSupabasePublicEnv();
  return `${url}\0${anonKey}`;
}

/**
 * Tarayıcı Supabase istemcisi — @supabase/ssr varsayılan cookie deposu.
 * Özel cookie handler kullanılmaz (çift encode / oturum silme riski).
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, anonKey } = getSupabasePublicEnv();

  if (!url || !anonKey) {
    if (typeof window !== "undefined") {
      clientLog("error", "supabase:browser-create", "NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.");
    }
  }

  return createBrowserClient(url, anonKey);
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient yalnızca tarayıcıda kullanılmalıdır. Sunucu bileşenlerinde getSupabaseServerClient kullanın.",
    );
  }
  const fp = supabaseBrowserEnvFingerprint();
  if (!browserClient || fp !== browserClientEnvFingerprint) {
    browserClient = createSupabaseBrowserClient();
    browserClientEnvFingerprint = fp;
  }
  return browserClient;
}
