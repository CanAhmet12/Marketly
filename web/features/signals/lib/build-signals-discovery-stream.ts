import { SIGNAL_MARKET_SECTIONS, type SignalMarketSectionDef } from "@/features/signals/lib/signal-market-sections";
import { resolveSignalAssetCategory } from "@/features/signals/lib/resolve-signal-asset-category";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import type { MarketAssetCategory } from "@/features/markets/types";

export type SignalsStreamBlock = {
  section: SignalMarketSectionDef;
  items: SignalsFeedRow[];
  round: number;
};

const SLICE_SIZE = 5;
const MAX_ROUNDS = 8;

function groupByCategory(rows: SignalsFeedRow[]): Map<MarketAssetCategory, SignalsFeedRow[]> {
  const map = new Map<MarketAssetCategory, SignalsFeedRow[]>();
  for (const section of SIGNAL_MARKET_SECTIONS) map.set(section.id, []);
  for (const row of rows) {
    const category = resolveSignalAssetCategory(row);
    const bucket = map.get(category) ?? [];
    bucket.push(row);
    map.set(category, bucket);
  }
  return map;
}

/** Piyasa segmentlerini keşfet akışı gibi döngüsel dilimler halinde sırala */
export function buildSignalsDiscoveryStream(rows: SignalsFeedRow[]): SignalsStreamBlock[] {
  if (!rows.length) return [];

  const grouped = groupByCategory(rows);
  const activeSections = SIGNAL_MARKET_SECTIONS.filter((s) => (grouped.get(s.id)?.length ?? 0) > 0);
  if (!activeSections.length) return [];

  const blocks: SignalsStreamBlock[] = [];
  let round = 0;

  while (round < MAX_ROUNDS) {
    let addedThisRound = false;
    for (const section of activeSections) {
      const pool = grouped.get(section.id) ?? [];
      const start = round * SLICE_SIZE;
      const slice = pool
        .slice(start, start + SLICE_SIZE)
        .filter((row) => resolveSignalAssetCategory(row) === section.id);
      if (!slice.length) continue;
      addedThisRound = true;
      blocks.push({ section, items: slice, round });
    }
    if (!addedThisRound) break;
    round++;
  }

  return blocks;
}
