import type { CreatorDirectoryRow } from "@/features/creators/types";
import type { CreatorFilters, CreatorFormatFilter, CreatorTierFilter } from "@/features/creators/creators-filters";
import {
  CREATOR_ASSET_PRESETS,
  CREATOR_FORMAT_OPTIONS,
  CREATOR_TIER_OPTIONS,
} from "@/features/creators/creators-filters";
import { filterCreators } from "@/features/creators/lib/filter-and-sort-creators";

export type CreatorFacetCounts = {
  format: Record<CreatorFormatFilter, number>;
  asset: Record<string, number>;
  tier: Record<CreatorTierFilter, number>;
  scopeFollowing: number;
};

function countWith(rows: CreatorDirectoryRow[], filters: CreatorFilters, viewerId: string | null): number {
  return filterCreators(rows, filters, viewerId).length;
}

/** Faceted navigation — her chip yanında sonuç sayısı (dead-end önleme). */
export function computeCreatorFacetCounts(
  allRows: CreatorDirectoryRow[],
  filters: CreatorFilters,
  viewerId: string | null,
): CreatorFacetCounts {
  const format = {} as Record<CreatorFormatFilter, number>;
  for (const o of CREATOR_FORMAT_OPTIONS) {
    format[o.id] = countWith(allRows, { ...filters, format: o.id }, viewerId);
  }

  const asset: Record<string, number> = {};
  for (const a of CREATOR_ASSET_PRESETS) {
    asset[a] = countWith(allRows, { ...filters, asset: a }, viewerId);
  }

  const tier = {} as Record<CreatorTierFilter, number>;
  for (const o of CREATOR_TIER_OPTIONS) {
    tier[o.id] = countWith(allRows, { ...filters, tier: o.id }, viewerId);
  }

  return {
    format,
    asset,
    tier,
    scopeFollowing: countWith(allRows, { ...filters, scope: "following" }, viewerId),
  };
}
