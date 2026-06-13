"use client";

import { useEffect, useRef } from "react";

import { nudgeLazyLoadMedia } from "@/lib/media/discover-media-loading";

/** İçerik görünür olduktan sonra lazy kapak/thumb yüklemesini tetikler */
export function useNudgeLazyMediaWhenReady(ready: boolean, resetKey?: string | number | null) {
  const prevReady = useRef(false);

  useEffect(() => {
    prevReady.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (!ready || prevReady.current) return;
    prevReady.current = true;
    nudgeLazyLoadMedia();
  }, [ready, resetKey]);
}
