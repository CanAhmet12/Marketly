"use client";

import { useEffect, useRef, useState } from "react";

/** P7-004 — fiyat hücresi rise/fall flash (CSS class tetikleyici) */
export function usePriceFlash(price: number): "rise" | "fall" | null {
  const prevRef = useRef(price);
  const [flash, setFlash] = useState<"rise" | "fall" | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === price) return;
    prevRef.current = price;
    setFlash(price > prev ? "rise" : "fall");
    const timer = window.setTimeout(() => setFlash(null), 650);
    return () => window.clearTimeout(timer);
  }, [price]);

  return flash;
}
