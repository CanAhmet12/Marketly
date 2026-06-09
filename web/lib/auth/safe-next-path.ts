/**
 * Login sonrası `next` query güvenliği — open redirect engeli.
 * Middleware ve istemci (LoginForm) aynı kuralları kullanır (Edge-safe, bağımlılık yok).
 */

const MAX_LEN = 512;

/** Pathname (+ opsiyonel ?query) — open redirect engeli; uygulama rotaları. */
const ALLOWED_PATH =
  /^\/(post|watch|channel|hub|results|upload|studio|settings|profile|messages|notifications|portfolio|saved|onboarding|discover|creators|close-friends|pulse|live|markets|signals|videos|watchlist|price-alerts|economic-calendar|market-news|search|subscriptions|playlist)(\/|$)/;

function pathnameOnly(path: string): string {
  const q = path.indexOf("?");
  return q === -1 ? path : path.slice(0, q);
}

function isAllowedPath(path: string): boolean {
  const pathname = pathnameOnly(path);
  if (pathname === "/" || pathname === "") return true;
  return ALLOWED_PATH.test(pathname);
}

/**
 * @param raw — decode edilmiş veya ham path (ör. `/post/abc` veya `%2Fpost%2F`)
 */
export function safeInternalNextPath(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== "string") return "/";
  let path = raw.trim();
  if (!path) return "/";
  try {
    path = decodeURIComponent(path);
  } catch {
    return "/";
  }
  path = path.trim();
  if (path.length > MAX_LEN) path = path.slice(0, MAX_LEN);
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("//")) return "/";
  if (path.includes("://")) return "/";
  const lower = path.toLowerCase();
  if (lower.startsWith("/\\")) return "/";
  if (!isAllowedPath(path)) return "/";
  return path;
}
