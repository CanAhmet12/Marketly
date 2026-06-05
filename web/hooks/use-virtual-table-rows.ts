"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

/** Bu eşiğin üzerinde sanal liste devreye girer */
export const MARKETS_VIRTUAL_ROW_THRESHOLD = 20;

export const MARKETS_DENSE_TABLE_ROW_HEIGHT = 44;
export const MARKETS_SCREENER_ROW_HEIGHT = 52;
export const MARKETS_WATCHLIST_ROW_HEIGHT = 48;
export const MARKETS_VIRTUAL_TABLE_MAX_HEIGHT = 480;

type Options = {
  count: number;
  rowHeight: number;
  maxHeight?: number;
  overscan?: number;
};

/**
 * Piyasalar tablo / screener sanallaştırma hook'u.
 * scrollRef → tablo sarmalayıcısına bağlanır.
 */
export function useVirtualTableRows({
  count,
  rowHeight,
  maxHeight = MARKETS_VIRTUAL_TABLE_MAX_HEIGHT,
  overscan = 8,
}: Options) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const enabled = count > MARKETS_VIRTUAL_ROW_THRESHOLD;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualRows = enabled ? virtualizer.getVirtualItems() : null;
  const totalSize = enabled ? virtualizer.getTotalSize() : 0;

  const scrollStyle = enabled ? ({ maxHeight, overflowY: "auto" as const }) : undefined;

  const tbodyStyle = enabled
    ? ({
        display: "block",
        height: totalSize,
        position: "relative",
      } as const)
    : undefined;

  function rowTransformStyle(start: number, size: number) {
    return {
      display: "table",
      width: "100%",
      tableLayout: "fixed" as const,
      position: "absolute" as const,
      top: 0,
      left: 0,
      height: size,
      transform: `translateY(${start}px)`,
    };
  }

  return {
    scrollRef,
    enabled,
    virtualizer,
    virtualRows,
    totalSize,
    scrollStyle,
    tbodyStyle,
    rowTransformStyle,
  };
}
