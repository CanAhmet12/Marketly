"use client";

import { useEffect } from "react";

import type { HomeFeedChipId } from "@/features/feed/home-feed-filters";

type HomeFeedRouter = {
  replace: (href: string, options?: { scroll?: boolean }) => void;
};

const STORAGE_KEY = "marketly-home-chip";

export function persistHomeFeedChip(chip: HomeFeedChipId) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, chip);
  } catch {
    /* quota / private mode */
  }
}

/** `/?chip=` yoksa son seçilen sekmeyi geri yükle (yalnızca following). */
export function useHomeFeedChipPersistence(chipParam: string | null, router: HomeFeedRouter) {
  useEffect(() => {
    if (chipParam) return;
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "following") {
        router.replace("/?chip=following", { scroll: false });
      }
    } catch {
      /* ignore */
    }
    // yalnızca ilk mount — chipParam sonradan değişince tekrar çalışmasın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
