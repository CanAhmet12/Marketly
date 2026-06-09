"use client";

import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export const VIRTUAL_LIST_THRESHOLD = 20;

export const SIGNALS_FEED_CARD_ESTIMATE = 200;
export const MESSAGES_INBOX_ITEM_ESTIMATE = 96;
export const MESSAGES_THREAD_DAY_ESTIMATE = 36;
export const MESSAGES_THREAD_BUBBLE_ESTIMATE = 58;
export const HOME_FEED_LEAD_ESTIMATE = 480;
export const HOME_FEED_CARD_ESTIMATE = 380;

export function homeFeedCardEstimate(index: number): number {
  return index === 0 ? HOME_FEED_LEAD_ESTIMATE : HOME_FEED_CARD_ESTIMATE;
}

type BaseOptions = {
  count: number;
  overscan?: number;
  threshold?: number;
};

type FixedSizeOptions = BaseOptions & {
  itemHeight: number;
};

type VariableSizeOptions = BaseOptions & {
  estimateSize: (index: number) => number;
};

/** Scroll container (overflow) içinde sanal liste — mesaj inbox / thread */
export function useContainerVirtualList({ count, itemHeight, overscan = 8, threshold = VIRTUAL_LIST_THRESHOLD }: FixedSizeOptions) {
  const scrollRef = useRef<HTMLElement | null>(null);
  const enabled = count > threshold;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  return {
    scrollRef,
    enabled,
    virtualizer,
    virtualItems: enabled ? virtualizer.getVirtualItems() : null,
    totalSize: enabled ? virtualizer.getTotalSize() : 0,
  };
}

/** Değişken satır yüksekliği — thread (gün ayırıcı + balon) */
export function useContainerVirtualListVariable({
  count,
  estimateSize,
  overscan = 10,
  threshold = VIRTUAL_LIST_THRESHOLD,
}: VariableSizeOptions) {
  const scrollRef = useRef<HTMLElement | null>(null);
  const enabled = count > threshold;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    overscan,
  });

  return {
    scrollRef,
    enabled,
    virtualizer,
    virtualItems: enabled ? virtualizer.getVirtualItems() : null,
    totalSize: enabled ? virtualizer.getTotalSize() : 0,
  };
}

/** Sayfa scroll — sinyaller feed kataloğu */
export function useWindowVirtualList({ count, itemHeight, overscan = 6, threshold = VIRTUAL_LIST_THRESHOLD }: FixedSizeOptions) {
  const enabled = count > threshold;

  const virtualizer = useWindowVirtualizer({
    count,
    estimateSize: () => itemHeight,
    overscan,
  });

  return {
    enabled,
    virtualizer,
    virtualItems: enabled ? virtualizer.getVirtualItems() : null,
    totalSize: enabled ? virtualizer.getTotalSize() : 0,
  };
}

/** Sayfa scroll — değişken yükseklik (home feed) */
export function useWindowVirtualListVariable({
  count,
  estimateSize,
  overscan = 4,
  threshold = VIRTUAL_LIST_THRESHOLD,
}: VariableSizeOptions) {
  const enabled = count > threshold;

  const virtualizer = useWindowVirtualizer({
    count,
    estimateSize,
    overscan,
  });

  return {
    enabled,
    virtualizer,
    virtualItems: enabled ? virtualizer.getVirtualItems() : null,
    totalSize: enabled ? virtualizer.getTotalSize() : 0,
  };
}
