"use client";

import { cloneElement, type HTMLAttributes, type ReactElement, type ReactNode } from "react";

import { VirtualizedTableRow } from "@/features/markets/components/virtualized-table-row";
import { useVirtualTableRows } from "@/hooks/use-virtual-table-rows";

type VirtualTableRowsProps<T> = {
  items: T[];
  getKey: (item: T, index: number) => string;
  renderRow: (item: T) => ReactElement<HTMLAttributes<HTMLTableRowElement>>;
};

/** Screener / tablo tbody satırlarını sanallaştırır */
export function renderVirtualTableRows<T>({
  items,
  vt,
  getKey,
  renderRow,
}: VirtualTableRowsProps<T> & {
  vt: ReturnType<typeof useVirtualTableRows>;
}): ReactNode[] {
  if (!vt.enabled || !vt.virtualRows) {
    return items.map((item, index) => {
      const row = renderRow(item);
      return cloneElement(row, { key: getKey(item, index) });
    });
  }

  return vt.virtualRows.map((vRow) => {
    const item = items[vRow.index]!;
    const row = renderRow(item);
    return (
      <VirtualizedTableRow key={vRow.key} enabled start={vRow.start} size={vRow.size}>
        {cloneElement(row, { key: getKey(item, vRow.index) })}
      </VirtualizedTableRow>
    );
  });
}

export { useVirtualTableRows };
