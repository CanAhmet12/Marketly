"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

/** Kart hover/focus'ta post detail sayfasını önceden yükle. */
export function useFeedPostPrefetch(href: string | null) {
  const router = useRouter();
  const doneRef = useRef(false);

  const prefetch = useCallback(() => {
    if (!href || doneRef.current) return;
    doneRef.current = true;
    router.prefetch(href);
  }, [href, router]);

  return prefetch;
}
