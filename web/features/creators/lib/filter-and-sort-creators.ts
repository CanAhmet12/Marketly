import type { CreatorDirectoryRow } from "@/features/creators/types";
import type { CreatorFilters, CreatorSortId } from "@/features/creators/creators-filters";
import { getMockFollowingCreatorIds } from "@/mock/fixtures/follows";

function assetMatches(row: CreatorDirectoryRow, asset: string): boolean {
  const a = asset.toUpperCase();
  const hay = [...row.assetTags, ...row.specialties].join(" ").toUpperCase();
  if (hay.includes(a)) return true;
  if (a === "BIST" && /BIST|THYAO|GARAN|XU100|HISSE/.test(hay)) return true;
  if (a === "FOREX" && /FOREX|DÖVİZ|USDTRY|EUR/.test(hay)) return true;
  if (a === "MAKRO" && /MAKRO|FAİZ|ENFLasyon/.test(hay)) return true;
  if (a === "BTC" && /BTC|KRİPTO|ETH|SOL/.test(hay)) return true;
  return false;
}

function formatMatches(row: CreatorDirectoryRow, format: CreatorFilters["format"]): boolean {
  if (format === "all") return true;
  if (format === "live") return row.isLive || (row.formatCounts.live ?? 0) > 0;
  return (row.formatCounts[format] ?? 0) > 0 || row.contentFormats.includes(format);
}

function tierMatches(row: CreatorDirectoryRow, tier: CreatorFilters["tier"]): boolean {
  if (tier === "all") return true;
  if (tier === "new") return row.rising;
  return row.tier.toLowerCase() === tier;
}

function searchMatches(row: CreatorDirectoryRow, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    row.displayName.toLowerCase().includes(needle) ||
    row.username.toLowerCase().includes(needle) ||
    row.handle.toLowerCase().includes(needle) ||
    row.specialties.some((s) => s.toLowerCase().includes(needle)) ||
    row.assetTags.some((t) => t.toLowerCase().includes(needle))
  );
}

function recommendedScore(row: CreatorDirectoryRow, followingIds: Set<string>): number {
  let s = 0;
  if (row.editorPick) s += 80;
  if (row.isLive) s += 55;
  s += (row.signalAccuracy ?? 0) * 0.4;
  s += Math.log10(row.followerCount + 1) * 12;
  s += row.activeSignalsCount * 6;
  if (row.rising) s += 15;
  if (followingIds.has(row.id)) s -= 40;
  return s;
}

function sortCreators(rows: CreatorDirectoryRow[], sort: CreatorSortId, followingIds: Set<string>): CreatorDirectoryRow[] {
  const copy = [...rows];
  switch (sort) {
    case "live":
      return copy.sort((a, b) => Number(b.isLive) - Number(a.isLive) || b.followerCount - a.followerCount);
    case "followers":
      return copy.sort((a, b) => b.followerCount - a.followerCount);
    case "newest":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "signals":
      return copy.sort(
        (a, b) =>
          b.activeSignalsCount - a.activeSignalsCount ||
          (b.bestSignalConfidence ?? 0) - (a.bestSignalConfidence ?? 0),
      );
    case "recommended":
    default:
      return copy.sort((a, b) => recommendedScore(b, followingIds) - recommendedScore(a, followingIds));
  }
}

export function filterCreators(
  rows: CreatorDirectoryRow[],
  filters: CreatorFilters,
  viewerId: string | null,
): CreatorDirectoryRow[] {
  const followingIds = new Set(getMockFollowingCreatorIds(viewerId));

  let out = rows.filter((row) => {
    if (!searchMatches(row, filters.q)) return false;
    if (!formatMatches(row, filters.format)) return false;
    if (filters.asset && !assetMatches(row, filters.asset)) return false;
    if (!tierMatches(row, filters.tier)) return false;
    if (filters.scope === "following" && !followingIds.has(row.id)) return false;
    return true;
  });

  out = sortCreators(out, filters.sort, followingIds);
  return out;
}

export function groupCreatorsByAsset(rows: CreatorDirectoryRow[], presets: readonly string[]): { asset: string; rows: CreatorDirectoryRow[] }[] {
  const used = new Set<string>();
  const groups: { asset: string; rows: CreatorDirectoryRow[] }[] = [];

  for (const asset of presets) {
    const matched = rows.filter((r) => !used.has(r.id) && assetMatches(r, asset)).slice(0, 4);
    if (matched.length >= 2) {
      matched.forEach((r) => used.add(r.id));
      groups.push({ asset, rows: matched });
    }
  }
  return groups.slice(0, 3);
}

export function filtersAreDefault(filters: CreatorFilters): boolean {
  return (
    !filters.q &&
    filters.format === "all" &&
    !filters.asset &&
    filters.tier === "all" &&
    filters.scope === "all" &&
    filters.sort === "recommended"
  );
}
