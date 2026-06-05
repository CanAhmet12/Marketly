"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Skeleton flicker önleme — 300ms altı yüklemelerde boş kalır */
export const SKELETON_SHOW_DELAY_MS = 300;

type Props = {
  children: ReactNode;
  delayMs?: number;
};

/**
 * P1-004: Kısa yüklemelerde skeleton flash'ını engeller.
 * Suspense fallback ve route loading.tsx içinde kullanılır.
 */
export function DelayedSkeleton({ children, delayMs = SKELETON_SHOW_DELAY_MS }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!visible) {
    return <div className="min-h-[40vh]" aria-hidden />;
  }

  return <>{children}</>;
}
