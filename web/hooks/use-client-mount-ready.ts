"use client";

import { useEffect, useState } from "react";

/**
 * True only after the first client commit. Use for UI that reads browser-only
 * state (localStorage, etc.) so SSR + hydration markup stay identical.
 */
export function useClientMountReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate hydration gate (SSR HTML === first paint)
    setReady(true);
  }, []);
  return ready;
}
