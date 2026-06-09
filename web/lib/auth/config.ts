/** Auth boot — yavaş ağ / cold start toleransı */
export const AUTH_SESSION_BOOT_TIMEOUT_MS = 12_000;

/** Boot timeout sonrası sessiz recovery denemesi */
export const AUTH_SESSION_BOOT_RETRIES = 2;

/** Edge + client guard — sert koruma gerektiren rotalar */
export const PROTECTED_ROUTE_PREFIXES = ["/upload", "/studio", "/settings", "/hub"] as const;

/** Oturum açıkken auth sayfalarından kaçınılacak prefixler */
export const AUTH_PAGE_PREFIXES = ["/auth/login", "/auth/register", "/auth/forgot-password"] as const;

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
