import type { BistScreenerAsset, BistTreemapCell } from "@/features/markets/bist/types";

import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";

export function buildBistTreemapCells(
  assets: readonly BistScreenerAsset[],
  limit = 10,
): BistTreemapCell[] {
  const sorted = [...assets]
    .sort((a, b) => parseVolumeLabel(b.marketCap ?? "0") - parseVolumeLabel(a.marketCap ?? "0"))
    .slice(0, limit);

  const total =
    sorted.reduce((sum, asset) => sum + parseVolumeLabel(asset.marketCap ?? "0"), 0) ||
    sorted.length ||
    1;

  return sorted.map((asset, index) => ({
    rank: index + 1,
    symbol: asset.symbol,
    name: asset.name,
    weightPct: (parseVolumeLabel(asset.marketCap ?? "0") / total) * 100 || 100 / sorted.length,
    changePct: asset.changeDay,
    marketCap: asset.marketCap ?? "—",
    sparkline: asset.sparkline.length >= 2 ? asset.sparkline : [asset.price, asset.price],
  }));
}

export function bistTreemapDominanceSummary(cells: readonly BistTreemapCell[]) {
  const top3 = cells.slice(0, 3);
  const top3Weight = top3.reduce((sum, cell) => sum + cell.weightPct, 0);
  return { top3, top3Weight };
}
