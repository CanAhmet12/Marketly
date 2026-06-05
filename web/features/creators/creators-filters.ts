/** Üreticiler sayfası — filtre / sıralama sözleşmesi + URL senkronu. */

export type CreatorFormatFilter = "all" | "live" | "signal" | "video" | "pulse";

export type CreatorTierFilter = "all" | "pro" | "elite" | "new";

export type CreatorScopeFilter = "all" | "following";

export type CreatorSortId = "recommended" | "live" | "followers" | "newest" | "signals";

export type CreatorFilters = {
  q: string;
  format: CreatorFormatFilter;
  asset: string | null;
  tier: CreatorTierFilter;
  scope: CreatorScopeFilter;
  sort: CreatorSortId;
};

export const CREATOR_ASSET_PRESETS = ["BTC", "ETH", "BIST", "Forex", "Makro", "VIOP"] as const;

export const CREATOR_FORMAT_OPTIONS: { id: CreatorFormatFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "live", label: "Canlı" },
  { id: "signal", label: "Sinyal" },
  { id: "video", label: "Video" },
  { id: "pulse", label: "Pulse" },
];

export const CREATOR_TIER_OPTIONS: { id: CreatorTierFilter; label: string }[] = [
  { id: "all", label: "Tüm tier" },
  { id: "pro", label: "Pro" },
  { id: "elite", label: "Elite" },
  { id: "new", label: "Yeni" },
];

export const CREATOR_SORT_OPTIONS: { id: CreatorSortId; label: string }[] = [
  { id: "recommended", label: "Önerilen" },
  { id: "live", label: "Canlı önce" },
  { id: "followers", label: "Takipçi" },
  { id: "newest", label: "Yeni" },
  { id: "signals", label: "Sinyal gücü" },
];

export const DEFAULT_CREATOR_FILTERS: CreatorFilters = {
  q: "",
  format: "all",
  asset: null,
  tier: "all",
  scope: "all",
  sort: "recommended",
};

function parseEnum<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  if (!raw) return fallback;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

export function creatorFiltersFromSearchParams(sp: URLSearchParams): CreatorFilters {
  return {
    q: sp.get("q")?.trim() ?? "",
    format: parseEnum(sp.get("format"), ["all", "live", "signal", "video", "pulse"] as const, "all"),
    asset: sp.get("asset")?.trim().toUpperCase() || null,
    tier: parseEnum(sp.get("tier"), ["all", "pro", "elite", "new"] as const, "all"),
    scope: parseEnum(sp.get("scope"), ["all", "following"] as const, "all"),
    sort: parseEnum(sp.get("sort"), ["recommended", "live", "followers", "newest", "signals"] as const, "recommended"),
  };
}

export function creatorFiltersToSearchParams(f: CreatorFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.format !== "all") sp.set("format", f.format);
  if (f.asset) sp.set("asset", f.asset);
  if (f.tier !== "all") sp.set("tier", f.tier);
  if (f.scope !== "all") sp.set("scope", f.scope);
  if (f.sort !== "recommended") sp.set("sort", f.sort);
  return sp;
}

export function creatorFiltersActiveCount(f: CreatorFilters): number {
  let n = 0;
  if (f.q) n++;
  if (f.format !== "all") n++;
  if (f.asset) n++;
  if (f.tier !== "all") n++;
  if (f.scope !== "all") n++;
  if (f.sort !== "recommended") n++;
  return n;
}
