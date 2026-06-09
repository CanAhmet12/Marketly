import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isAuthPage, isProtectedRoute } from "@/lib/auth/config";
import { safeInternalNextPath } from "@/lib/auth/safe-next-path";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

function isMockBypassAtEdge(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const raw = process.env.NEXT_PUBLIC_USE_MOCK_DATA ?? process.env.NEXT_PUBLIC_USE_MOCK ?? "";
  const v = String(raw).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

function applyCookiesToResponse(
  response: NextResponse,
  cookiesToSet: CookieToSet[],
  cacheHeaders?: Record<string, string>,
): void {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });
  if (cacheHeaders) {
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
}

function copyResponseCookies(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

/**
 * Her istekte oturum yenileme (Supabase resmi pattern).
 * Korumalı rotalarda ek olarak login redirect uygular.
 *
 * Instagram/Twitter/BFF benzeri: sunucu cookie oturumunu her navigasyonda tazeler;
 * istemci yalnızca UI state taşır.
 */
export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  if (isMockBypassAtEdge()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[], cacheHeaders?: Record<string, string>) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        applyCookiesToResponse(supabaseResponse, cookiesToSet, cacheHeaders);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute(pathname) && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.search = "";
    const nextTarget = safeInternalNextPath(pathname + request.nextUrl.search);
    login.searchParams.set("next", nextTarget);
    const redirect = NextResponse.redirect(login);
    copyResponseCookies(supabaseResponse, redirect);
    return redirect;
  }

  if (user && isAuthPage(pathname)) {
    const nextRaw = request.nextUrl.searchParams.get("next");
    const target = nextRaw?.trim() ? safeInternalNextPath(nextRaw) : "/";
    const redirectUrl = request.nextUrl.clone();
    const q = target.indexOf("?");
    redirectUrl.pathname = q === -1 ? target : target.slice(0, q);
    redirectUrl.search = q === -1 ? "" : target.slice(q);
    const redirect = NextResponse.redirect(redirectUrl);
    copyResponseCookies(supabaseResponse, redirect);
    return redirect;
  }

  return supabaseResponse;
}

/** @deprecated isProtectedRoute kullanın */
export function isProtectedPath(pathname: string): boolean {
  return isProtectedRoute(pathname);
}
