"use client";

import { useEffect } from "react";

import type { HomeFeedChipId } from "@/features/feed/home-feed-filters";
import { isTypingTarget } from "@/lib/keyboard-target";

/** Ana akışta `J` ile Senin için ↔ Takip sekmesi değiştir. */
export function useHomeFeedTabShortcut(
  chip: HomeFeedChipId,
  onSetChip: (id: HomeFeedChipId) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "j" && e.key !== "J") return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      onSetChip(chip === "for_you" ? "following" : "for_you");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chip, enabled, onSetChip]);
}
