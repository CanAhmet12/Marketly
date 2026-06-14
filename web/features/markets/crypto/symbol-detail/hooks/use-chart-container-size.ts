"use client";

import { useEffect, useState, type RefObject } from "react";

export type ChartSize = {
  width: number;
  height: number;
  ready: boolean;
};

const MIN_W = 240;
const MIN_H = 320;

function readSize(el: HTMLElement, fallbackHeight: number): ChartSize {
  const width = Math.max(0, Math.floor(el.clientWidth || el.offsetWidth || 0));
  const height = Math.max(0, Math.floor(el.clientHeight || el.offsetHeight || 0));
  const resolvedH = height > 0 ? height : fallbackHeight;
  return {
    width,
    height: resolvedH,
    ready: width >= MIN_W && height >= MIN_H,
  };
}

/** Stage/host boyutu — tam ekran modal için clientWidth/Height + gecikmeli retry. */
export function useChartContainerSize(
  hostRef: RefObject<HTMLElement | null>,
  fallbackHeight = 520,
  enabled = true,
): ChartSize {
  const [size, setSize] = useState<ChartSize>({ width: 0, height: fallbackHeight, ready: false });

  useEffect(() => {
    if (!enabled) {
      setSize({ width: 0, height: fallbackHeight, ready: false });
      return;
    }

    let ro: ResizeObserver | null = null;
    let cancelled = false;
    const timers: number[] = [];

    const sync = () => {
      const el = hostRef.current;
      if (!el || cancelled) return;
      setSize(readSize(el, fallbackHeight));
    };

    const attach = () => {
      const el = hostRef.current;
      if (!el) return;
      sync();
      ro = new ResizeObserver(sync);
      ro.observe(el);
    };

    attach();
    timers.push(window.setTimeout(sync, 0));
    timers.push(window.setTimeout(sync, 50));
    timers.push(window.setTimeout(sync, 150));
    timers.push(window.setTimeout(sync, 320));
    requestAnimationFrame(() => {
      sync();
      requestAnimationFrame(sync);
    });

    return () => {
      cancelled = true;
      ro?.disconnect();
      for (const t of timers) window.clearTimeout(t);
    };
  }, [enabled, fallbackHeight, hostRef]);

  return size;
}

export type TerminalChartLayout = {
  width: number;
  height: number;
};
