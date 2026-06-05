import type { AffinityContext } from "@/features/personalization/domain/personalization-types";
import { filterSignalFeed } from "@/features/signals/lib/filter-feed";
import type { SignalFiltersState } from "@/features/signals/signals-filters";
import { SIGNAL_CHIP_OPTIONS, SIGNAL_DIRECTION_OPTIONS } from "@/features/signals/signals-filters";
import type { SignalDirectionFilter, SignalFilterChipId } from "@/features/signals/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

export type SignalFacetCounts = {
  direction: Record<SignalDirectionFilter, number>;
  chips: Record<SignalFilterChipId, number>;
};

function countWith(
  rows: SignalsFeedRow[],
  state: SignalFiltersState,
  focusAsset: string | null,
  affinity: AffinityContext | null,
): number {
  return filterSignalFeed(
    rows,
    state.chips,
    state.analystId,
    state.minConfidence,
    focusAsset,
    state.direction,
    state.sort,
    affinity,
  ).length;
}

/** Faceted navigation — chip/direction yanında sonuç sayısı. */
export function computeSignalFacetCounts(
  allRows: SignalsFeedRow[],
  state: SignalFiltersState,
  focusAsset: string | null,
  affinity: AffinityContext | null,
): SignalFacetCounts {
  const direction = {} as Record<SignalDirectionFilter, number>;
  for (const o of SIGNAL_DIRECTION_OPTIONS) {
    direction[o.id] = countWith(allRows, { ...state, direction: o.id }, focusAsset, affinity);
  }

  const chips = {} as Record<SignalFilterChipId, number>;
  for (const o of SIGNAL_CHIP_OPTIONS) {
    const nextChips = new Set(state.chips);
    if (!nextChips.has(o.id)) nextChips.add(o.id);
    chips[o.id] = countWith(allRows, { ...state, chips: nextChips }, focusAsset, affinity);
  }

  return { direction, chips };
}
