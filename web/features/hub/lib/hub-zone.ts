export type HubZoneId =
  | "overview"
  | "profile"
  | "finance"
  | "connect"
  | "tools"
  | "inbox";

export function resolveHubZone(pathname: string): HubZoneId {
  if (!pathname.startsWith("/hub")) return "profile";
  if (pathname === "/hub" || pathname === "/hub/") return "profile";
  if (pathname.startsWith("/hub/profile") || pathname.startsWith("/hub/channel")) return "profile";
  if (
    pathname.startsWith("/hub/portfolio") ||
    pathname.startsWith("/hub/watchlist") ||
    pathname.startsWith("/hub/price-alerts")
  ) {
    return "finance";
  }
  if (pathname.startsWith("/hub/messages") || pathname.startsWith("/hub/notifications")) {
    return "inbox";
  }
  if (
    pathname.startsWith("/hub/saved") ||
    pathname.startsWith("/hub/subscriptions") ||
    pathname.startsWith("/hub/close-friends")
  ) {
    return "connect";
  }
  if (pathname.startsWith("/hub/settings") || pathname.startsWith("/hub/studio") || pathname.startsWith("/hub/upload")) {
    return "tools";
  }
  return "profile";
}
