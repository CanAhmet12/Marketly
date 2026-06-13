import { DISCOVER_HUB_PATH, DISCOVER_VERTICAL_ROUTES } from "@/features/discover/lib/discover-route-constants";
import type { VRTabId } from "@/features/discover/visual-reference/discover-visual-reference-tabs";

/** Eski `?tab=` parametreleri → bağımsız tam sayfa */
export const DISCOVER_TAB_REDIRECTS: Record<VRTabId | "shorts", string> = {
  live: DISCOVER_VERTICAL_ROUTES.live,
  pulse: DISCOVER_VERTICAL_ROUTES.pulse,
  shorts: DISCOVER_VERTICAL_ROUTES.pulse,
  videos: DISCOVER_VERTICAL_ROUTES.videos,
  signals: DISCOVER_VERTICAL_ROUTES.signals,
  creators: DISCOVER_VERTICAL_ROUTES.creators,
};

/** @deprecated Hub sekmeleri kaldırıldı — tam sayfa rotaları */
export const DISCOVER_HUB_TAB_ROUTES: Record<VRTabId, string> = {
  live: DISCOVER_VERTICAL_ROUTES.live,
  pulse: DISCOVER_VERTICAL_ROUTES.pulse,
  videos: DISCOVER_VERTICAL_ROUTES.videos,
  signals: DISCOVER_VERTICAL_ROUTES.signals,
  creators: DISCOVER_VERTICAL_ROUTES.creators,
};

export function buildDiscoverHubTabUrl(tab: VRTabId): string {
  return DISCOVER_HUB_TAB_ROUTES[tab];
}

export function discoverHubTabFromHref(href: string): VRTabId | null {
  try {
    const url = new URL(href, "https://marketly.local");
    if (url.pathname !== DISCOVER_HUB_PATH) return null;
    const tab = url.searchParams.get("tab");
    if (tab === "live" || tab === "pulse" || tab === "videos" || tab === "signals" || tab === "creators") {
      return tab;
    }
    return null;
  } catch {
    return null;
  }
}

export function resolveDiscoverTabRedirect(tab: string | null): string | null {
  if (!tab) return null;
  if (tab in DISCOVER_TAB_REDIRECTS) {
    return DISCOVER_TAB_REDIRECTS[tab as keyof typeof DISCOVER_TAB_REDIRECTS];
  }
  return null;
}

