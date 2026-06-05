import type { SearchTabGroupId, SearchTabId } from "@/features/search/types";

const LEGACY_TAB_TO_GROUP: Record<SearchTabId, SearchTabGroupId> = {
  all: "all",
  videos: "content",
  pulse: "content",
  live: "content",
  posts: "content",
  creators: "people",
  rooms: "people",
  signals: "markets",
  markets: "markets",
  discussions: "community",
  communities: "community",
};

const VALID_GROUPS = new Set<SearchTabGroupId>(["all", "content", "people", "markets", "community"]);

export function isSearchTabGroupId(x: string): x is SearchTabGroupId {
  return VALID_GROUPS.has(x as SearchTabGroupId);
}

export function tabGroupFromParam(raw: string | null): SearchTabGroupId {
  if (!raw) return "all";
  if (isSearchTabGroupId(raw)) return raw;
  if (raw in LEGACY_TAB_TO_GROUP) return LEGACY_TAB_TO_GROUP[raw as SearchTabId];
  return "all";
}

export function buildSearchUrl(q: string, tab: SearchTabGroupId): string {
  const params = new URLSearchParams();
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  if (tab !== "all") params.set("tab", tab);
  const qs = params.toString();
  return qs ? `/results?${qs}` : "/results";
}
