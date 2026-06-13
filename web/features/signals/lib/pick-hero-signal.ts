import type { SignalsFeedRow } from "@/features/signals/repository/types";

function tradePool(rows: SignalsFeedRow[]): SignalsFeedRow[] {
  return rows.filter((r) => r.is_active);
}

/** Katalog geneli — en güçlü spotlight sinyali */
export function pickHeroSignal(rows: SignalsFeedRow[]): SignalsFeedRow | null {
  const pool = tradePool(rows);
  if (!pool.length) return null;

  return [...pool].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.freshness_score - a.freshness_score;
  })[0]!;
}

/** Hero bento sağ panel — güven liderleri */
export function topSignalsByConfidence(
  rows: SignalsFeedRow[],
  excludeId?: string,
  limit = 4,
): SignalsFeedRow[] {
  return rows
    .filter((r) => r.is_active && r.id !== excludeId)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
