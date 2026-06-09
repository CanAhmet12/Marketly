export const STUDIO_DEFAULT_BASE = "/studio";
export const STUDIO_HUB_BASE = "/hub/studio";
export const UPLOAD_DEFAULT_PATH = "/upload";
export const UPLOAD_HUB_PATH = "/hub/upload";

/** /studio/... → /hub/studio/... (hub gömülü mod) */
export function mapStudioBaseHref(href: string, base = STUDIO_DEFAULT_BASE): string {
  if (base === STUDIO_DEFAULT_BASE) return href;
  if (href === STUDIO_DEFAULT_BASE) return base;
  if (href.startsWith(`${STUDIO_DEFAULT_BASE}/`)) {
    return href.replace(STUDIO_DEFAULT_BASE, base);
  }
  return href;
}

/** Hub pathname → studio zone çözümlemesi için normalize */
export function normalizeStudioPath(pathname: string): string {
  if (pathname === STUDIO_HUB_BASE || pathname === `${STUDIO_HUB_BASE}/`) {
    return STUDIO_DEFAULT_BASE;
  }
  if (pathname.startsWith(`${STUDIO_HUB_BASE}/`)) {
    return pathname.replace(STUDIO_HUB_BASE, STUDIO_DEFAULT_BASE);
  }
  return pathname;
}

export function isStudioRouteActive(
  pathname: string,
  href: string,
  base = STUDIO_DEFAULT_BASE,
  end?: boolean,
): boolean {
  const mappedHref = mapStudioBaseHref(href, base);
  const normalizedPath = base === STUDIO_HUB_BASE ? normalizeStudioPath(pathname) : pathname;
  const normalizedHref = base === STUDIO_HUB_BASE ? normalizeStudioPath(mappedHref) : mappedHref;
  if (end) return normalizedPath === normalizedHref;
  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
}
