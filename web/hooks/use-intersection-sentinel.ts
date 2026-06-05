"use client";

import { useEffect, useRef, type RefObject } from "react";

type Options = {
  /** Sentinel aktif mi */
  enabled: boolean;
  /** Görünür olunca tetiklenir */
  onVisible: () => void;
  /** Scroll kökü (null = viewport) */
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

/** P9-001/002 — feed sonu görünür olunca load-more tetikleyici */
export function useIntersectionSentinel({
  enabled,
  onVisible,
  root = null,
  rootMargin = "320px 0px 480px 0px",
  threshold = 0,
}: Options): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onVisibleRef.current();
        }
      },
      { root, rootMargin, threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled, root, rootMargin, threshold]);

  return ref;
}
