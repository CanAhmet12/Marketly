import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { safeInternalNextPath } from "@/lib/auth/safe-next-path";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

/**
 * Supabase PKCE / e-posta onay / şifre sıfırlama code exchange.
 * Resmi pattern: exchange sonrası redirect response'a cookie yazılır.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeInternalNextPath(searchParams.get("next"));
  const { url, anonKey } = getSupabasePublicEnv();

  if (!code || !url || !anonKey) {
    const login = new URL("/auth/login", origin);
    login.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(login);
  }

  const cookieStore = await cookies();
  let cacheHeaders: Record<string, string> | undefined;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[], headers?: Record<string, string>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
        });
        cacheHeaders = headers;
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const login = new URL("/auth/login", origin);
    login.searchParams.set("error", "auth_callback_failed");
    if (next !== "/") login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  const response = NextResponse.redirect(new URL(next, origin));
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie);
    }
  });
  if (cacheHeaders) {
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}
