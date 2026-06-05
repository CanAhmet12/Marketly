import type { SearchResultBundle, SearchSplitPosts, SearchTabCounts } from "@/features/search/types";

export function computeSearchTabCounts(
  bundle: SearchResultBundle | undefined,
  split: SearchSplitPosts,
): SearchTabCounts {
  const content =
    split.videos.length +
    split.pulsePosts.length +
    split.livePosts.length +
    split.textPosts.length;
  const people = (bundle?.channels.length ?? 0) + (bundle?.creatorRooms.length ?? 0);
  const markets = (bundle?.signals.length ?? 0) + (bundle?.markets.length ?? 0);
  const community = (bundle?.discussions.length ?? 0) + (bundle?.communities.length ?? 0);
  const all = content + people + markets + community;
  return { all, content, people, markets, community };
}

export const SEARCH_TAB_LABELS: { id: keyof SearchTabCounts; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "content", label: "İçerik" },
  { id: "people", label: "İnsanlar" },
  { id: "markets", label: "Piyasalar & Sinyaller" },
  { id: "community", label: "Topluluk" },
];
