import type { CreatorContentItem, StudioContentKind, StudioContentStatus } from "@/features/studio/repository/types";

export type ContentViewMode = "grid" | "table";

export type ContentSortKey = "date" | "views" | "title" | "engagement";

export type ContentSortDir = "asc" | "desc";

export type ContentLibraryFilters = {
  query: string;
  kind: "all" | StudioContentKind;
  status: "all" | StudioContentStatus;
  sortKey: ContentSortKey;
  sortDir: ContentSortDir;
};

export const DEFAULT_CONTENT_FILTERS: ContentLibraryFilters = {
  query: "",
  kind: "all",
  status: "all",
  sortKey: "date",
  sortDir: "desc",
};

function engagementScore(item: CreatorContentItem): number {
  return item.likes + item.comments;
}

function compareStrings(a: string, b: string, dir: ContentSortDir): number {
  const cmp = a.localeCompare(b, "tr");
  return dir === "asc" ? cmp : -cmp;
}

function compareNumbers(a: number, b: number, dir: ContentSortDir): number {
  return dir === "asc" ? a - b : b - a;
}

export function sortContentItems(
  items: CreatorContentItem[],
  sortKey: ContentSortKey,
  sortDir: ContentSortDir,
): CreatorContentItem[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    switch (sortKey) {
      case "title":
        return compareStrings(a.title, b.title, sortDir);
      case "views":
        return compareNumbers(a.views, b.views, sortDir);
      case "engagement":
        return compareNumbers(engagementScore(a), engagementScore(b), sortDir);
      case "date":
      default: {
        const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return compareNumbers(aTime, bTime, sortDir);
      }
    }
  });
  return sorted;
}

export function filterContentItems(
  items: CreatorContentItem[],
  filters: Pick<ContentLibraryFilters, "query" | "kind" | "status">,
): CreatorContentItem[] {
  const q = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.kind !== "all" && item.kind !== filters.kind) return false;
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.preview.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });
}

export function applyContentLibrary(
  items: CreatorContentItem[],
  filters: ContentLibraryFilters,
): CreatorContentItem[] {
  const filtered = filterContentItems(items, filters);
  return sortContentItems(filtered, filters.sortKey, filters.sortDir);
}

export function toggleSort(
  current: Pick<ContentLibraryFilters, "sortKey" | "sortDir">,
  nextKey: ContentSortKey,
): Pick<ContentLibraryFilters, "sortKey" | "sortDir"> {
  if (current.sortKey === nextKey) {
    return { sortKey: nextKey, sortDir: current.sortDir === "desc" ? "asc" : "desc" };
  }
  const defaultDir: ContentSortDir = nextKey === "title" ? "asc" : "desc";
  return { sortKey: nextKey, sortDir: defaultDir };
}
