import { type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/session-middleware";

/**
 * Next.js 16 proxy — tüm uygulama isteklerinde Supabase oturum yenileme.
 * (Robinhood/BFF + Supabase SSR standardı: cookie refresh her navigasyonda)
 */
export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    /*
     * Statik assetler hariç tüm rotalar — session cookie refresh için zorunlu.
     * Dar matcher session kaybına yol açar (önceki bug).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)",
  ],
};
