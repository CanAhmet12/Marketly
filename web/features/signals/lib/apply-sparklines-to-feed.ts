import type { SignalsFeedRow } from "@/features/signals/repository/types";

/** RPC sparkline serisini feed satırlarına uygular — sentetik seri korunur */
export function applySparklinesToFeedRows(
  rows: SignalsFeedRow[],
  sparkBySymbol: Map<string, number[]>,
): SignalsFeedRow[] {
  if (!sparkBySymbol.size) return rows;

  return rows.map((row) => {
    const keys = [row.symbol, row.asset_id].map((k) => k?.trim().toUpperCase()).filter(Boolean);
    for (const key of keys) {
      const pts = sparkBySymbol.get(key);
      if (pts && pts.length >= 2) {
        return { ...row, sparkline: pts };
      }
    }
    return row;
  });
}
