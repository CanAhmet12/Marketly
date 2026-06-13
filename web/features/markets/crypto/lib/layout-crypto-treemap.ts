import type { CryptoTreemapCell } from "@/features/markets/crypto/types";

export type TreemapLayoutRect = {
  cell: CryptoTreemapCell;
  left: number;
  top: number;
  width: number;
  height: number;
};

type WeightedCell = CryptoTreemapCell & { area: number };

/** Satır bazlı squarified layout — yüzde koordinatları (0–100) */
export function layoutCryptoTreemap(cells: readonly CryptoTreemapCell[]): TreemapLayoutRect[] {
  if (!cells.length) return [];

  const total = cells.reduce((sum, cell) => sum + cell.weightPct, 0) || 1;
  const weighted: WeightedCell[] = cells.map((cell) => ({
    ...cell,
    area: cell.weightPct / total,
  }));

  const rows: WeightedCell[][] = [];
  let pool = [...weighted];

  while (pool.length) {
    const row: WeightedCell[] = [];
    let rowSum = 0;
    const target = pool.length <= 3 ? 1 : 0.52;

    while (pool.length && (row.length === 0 || rowSum < target)) {
      const next = pool.shift()!;
      row.push(next);
      rowSum += next.area;
    }
    rows.push(row);
  }

  const rowHeight = 100 / rows.length;
  const rects: TreemapLayoutRect[] = [];
  let top = 0;

  for (const row of rows) {
    const rowTotal = row.reduce((sum, cell) => sum + cell.area, 0) || 1;
    let left = 0;

    for (const cell of row) {
      const width = (cell.area / rowTotal) * 100;
      rects.push({
        cell,
        left,
        top,
        width,
        height: rowHeight,
      });
      left += width;
    }
    top += rowHeight;
  }

  return rects;
}

export function treemapDominanceSummary(cells: readonly CryptoTreemapCell[]) {
  const top3 = cells.slice(0, 3);
  const top3Weight = top3.reduce((sum, cell) => sum + cell.weightPct, 0);
  return { top3, top3Weight };
}
