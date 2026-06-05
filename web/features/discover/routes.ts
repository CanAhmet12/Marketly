/** Keşfet hub + bağımsız dikey keşif rotaları */
export const DISCOVER_HUB_PATH = "/discover";

export const DISCOVER_VERTICAL_ROUTES = {
  live: "/live",
  pulse: "/pulse",
  videos: "/videos",
  signals: "/signals",
  creators: "/creators",
} as const;

export type DiscoverVerticalRouteKey = keyof typeof DISCOVER_VERTICAL_ROUTES;
