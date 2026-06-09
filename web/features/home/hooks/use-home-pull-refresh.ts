"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  onRefresh: () => void;
  isFetching: boolean;
  disabled?: boolean;
  threshold?: number;
};

/** Mobil — sayfa tepesindeyken aşağı çekerek yenile. */
export function useHomePullRefresh({
  onRefresh,
  isFetching,
  disabled = false,
  threshold = 72,
}: Options) {
  const [pullDistance, setPullDistance] = useState(0);
  const [pulling, setPulling] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);
  const distanceRef = useRef(0);

  useEffect(() => {
    if (!isFetching) {
      setPullDistance(0);
      setPulling(false);
      distanceRef.current = 0;
    }
  }, [isFetching]);

  useEffect(() => {
    if (disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 4 || isFetching) return;
      startY.current = e.touches[0]?.clientY ?? 0;
      active.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active.current || isFetching) return;
      const y = e.touches[0]?.clientY ?? 0;
      const delta = y - startY.current;
      if (delta <= 0 || window.scrollY > 4) {
        distanceRef.current = 0;
        setPullDistance(0);
        setPulling(false);
        return;
      }
      const damped = Math.min(delta * 0.42, threshold * 1.4);
      distanceRef.current = damped;
      setPullDistance(damped);
      setPulling(true);
      if (damped > 8) e.preventDefault();
    };

    const finish = () => {
      if (!active.current) return;
      active.current = false;
      if (distanceRef.current >= threshold && !isFetching) {
        onRefresh();
        setPulling(true);
      } else {
        distanceRef.current = 0;
        setPullDistance(0);
        setPulling(false);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", finish, { passive: true });
    window.addEventListener("touchcancel", finish, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", finish);
      window.removeEventListener("touchcancel", finish);
    };
  }, [disabled, isFetching, onRefresh, threshold]);

  const progress = Math.min(1, pullDistance / threshold);
  const ready = progress >= 1;

  return {
    pullDistance,
    pulling: pulling || isFetching,
    progress,
    ready,
    refreshing: isFetching,
    threshold,
  };
}
