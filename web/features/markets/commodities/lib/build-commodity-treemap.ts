import type { CommodityScreenerAsset, CommodityTreemapCell } from "@/features/markets/commodities/types";

import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";

export function buildCommodityTreemapCells(
  assets: readonly CommodityScreenerAsset[],
  limit = 10,
): CommodityTreemapCell[] {
  const sorted = [...assets]
    .sort((a, b) => parseVolumeLabel(b.volume ?? "0") - parseVolumeLabel(a.volume ?? "0"))
    .slice(0, limit);

  const total =
    sorted.reduce((sum, asset) => sum + parseVolumeLabel(asset.volume ?? "0"), 0) ||
    sorted.length ||
    1;

  return sorted.map((asset, index) => ({
    rank: index + 1,
    symbol: asset.symbol,
    name: asset.name,
    weightPct: (parseVolumeLabel(asset.volume ?? "0") / total) * 100 || 100 / sorted.length,
    changePct: asset.changeDay,
    volume: asset.volume ?? "—",
    sparkline: asset.sparkline.length >= 2 ? asset.sparkline : [asset.price, asset.price],
  }));
}

export function commodityTreemapDominanceSummary(cells: readonly CommodityTreemapCell[]) {
  const top3 = cells.slice(0, 3);
  const top3Weight = top3.reduce((sum, cell) => sum + cell.weightPct, 0);
  return { top3, top3Weight };
}
