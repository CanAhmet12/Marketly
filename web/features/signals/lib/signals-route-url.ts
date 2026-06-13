import type { SignalsFeedScope } from "@/features/signals/fetch-signals-feed";
import {
  signalFiltersToSearchParams,
  type SignalFiltersState,
} from "@/features/signals/signals-filters";

export type SignalsRouteContext = "page" | "discover-tab";

export function buildSignalsRouteUrl(
  ctx: SignalsRouteContext,
  f: SignalFiltersState,
  focusAsset?: string | null,
  signalId?: string | null,
  scope: SignalsFeedScope = "live",
): string {
  const sp = signalFiltersToSearchParams(f, focusAsset, signalId);
  if (scope === "archive") sp.set("view", "archive");
  if (ctx === "discover-tab") sp.set("tab", "signals");
  const base = ctx === "discover-tab" ? "/discover" : "/signals";
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export function signalsScopeFromSearchParams(sp: URLSearchParams): SignalsFeedScope {
  return sp.get("view") === "archive" ? "archive" : "live";
}
