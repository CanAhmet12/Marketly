import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { computeSignalsHero } from "@/features/signals/lib/compute-signals-hero";
import { mapSignalsPageRowToFeedRow } from "@/features/signals/lib/map-page-row-to-feed-row";

import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";
import { getMockSignalsPageRows } from "./signals-page";
import { getMockCreatedSignals } from "./upload-store";
import { displayAssetNameForSymbol } from "./signals-source";

export type { SignalStrategy, SignalsFeedRow } from "@/features/signals/repository/types";
export { computeSignalsHero };

export function getMockSignalsFeedRows(): SignalsFeedRow[] {
  const fixtureRows = getMockSignalsPageRows();
  const fixtureIds = new Set(fixtureRows.map((r) => r.id));

  // Prepend localStorage-created signals
  const createdSignals = getMockCreatedSignals().filter((s) => !fixtureIds.has(s.id));
  const createdPageRows = createdSignals.map((s) => {
    const prof = MOCK_PROFILE_BY_ID[s.creator_id];
    return {
      ...s,
      creator_display: prof?.full_name ?? prof?.username ?? "Sen",
      asset_display_name: displayAssetNameForSymbol(s.symbol),
      detail_href: `/signals?asset=${encodeURIComponent(s.symbol)}`,
    };
  });

  return [...createdPageRows, ...fixtureRows].map((s) => {
    const prof = MOCK_PROFILE_BY_ID[s.creator_id];
    return mapSignalsPageRowToFeedRow(s, {
      id: s.creator_id,
      display: prof?.full_name ?? prof?.username ?? "Analist",
      avatar_url: prof?.avatar_url ?? null,
      verified: Boolean(prof?.verified),
      follower_count: prof?.follower_count ?? 0,
      accuracy: prof?.signal_accuracy ?? null,
      specialties: prof?.specialties ?? null,
      tier: prof?.tier ?? "free",
      strategy_style: prof?.strategy_style ?? null,
    });
  });
}
