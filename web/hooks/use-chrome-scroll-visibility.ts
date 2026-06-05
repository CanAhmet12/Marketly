"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_DOWN_DELTA = 12;
const SCROLL_UP_DELTA = -12;
/** Gizle/göster sonrası layout kaymasını yok say (ms) — top-bar 200ms animasyon + settle */
const TOGGLE_COOLDOWN_MS = 240;
/** Bu mesafenin altındayken üst çubuk her zaman görünsün */
const NEAR_TOP_FORCE_SHOW_PX = 48;

function readScrollY(): number {
  if (typeof document === "undefined") return 0;
  const root = document.scrollingElement ?? document.documentElement;
  const y = root.scrollTop;
  if (y > 0) return y;
  return window.scrollY || document.body.scrollTop || 0;
}

/**
 * Aşağı kaydırınca üst çubuğu gizlemek, yukarı kaydırınca göstermek için.
 *
 * Titreşim: spacer yüksekliği değişince tetiklenen sahte scroll olayları toggle
 * sonrası kısa cooldown ile yok sayılır.
 */
export function useChromeScrollVisibility(): boolean {
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);
  const lastY = useRef(0);
  const cooldownUntil = useRef(0);

  useEffect(() => {
    lastY.current = readScrollY();

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      return;
    }

    const setVisibleSafe = (next: boolean, y: number) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      cooldownUntil.current = performance.now() + TOGGLE_COOLDOWN_MS;
      lastY.current = y;
      setVisible(next);
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        const now = performance.now();
        const y = readScrollY();

        if (now < cooldownUntil.current) {
          lastY.current = y;
          return;
        }

        const prev = lastY.current;
        lastY.current = y;

        if (y <= NEAR_TOP_FORCE_SHOW_PX) {
          setVisibleSafe(true, y);
          return;
        }

        const delta = y - prev;
        if (delta > SCROLL_DOWN_DELTA) {
          setVisibleSafe(false, y);
        } else if (delta < SCROLL_UP_DELTA) {
          setVisibleSafe(true, y);
        }
      });
    };

    const root = document.scrollingElement ?? document.documentElement;
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return visible;
}
