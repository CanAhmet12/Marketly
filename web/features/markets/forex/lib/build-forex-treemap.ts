import type { ForexScreenerAsset, ForexTreemapCell } from "@/features/markets/forex/types";

import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";

export function buildForexTreemapCells(
  assets: readonly ForexScreenerAsset[],
  limit = 10,
): ForexTreemapCell[] {
  const sorted = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume ?? "0") - parseVolumeLabel(a.volume ?? "0"))
    .slice(0, limit);

  const total =
    sorted.reduce((sum, asset) => sum + parseVolumeLabel(asset.volume ?? "0"), 0) ||
    sorted.length ||
    1;

  return sorted.map((asset, index) => ({
    rank: index + 1,
    symbol: asset.pair.replace("/", ""),
    pair: asset.pair,
    weightPct: (parseVolumeLabel(asset.volume ?? "0") / total) * 100 || 100 / sorted.length,
    changePct: asset.changePct,
    volume: asset.volume ?? "—",
    sparkline: asset.sparkline.length >= 2 ? asset.sparkline : [asset.bid, asset.ask],
  }));
}

export function forexTreemapDominanceSummary(cells: readonly ForexTreemapCell[]) {
  const top3 = cells.slice(0, 3);
  const top3Weight = top3.reduce((sum, cell) => sum + cell.weightPct, 0);
  return { top3, top3Weight };
}
