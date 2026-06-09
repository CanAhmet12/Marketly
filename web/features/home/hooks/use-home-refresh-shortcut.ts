"use client";

import { useEffect } from "react";

import { isTypingTarget } from "@/lib/keyboard-target";

/** Ana akışta `R` ile akışı yenile. */
export function useHomeRefreshShortcut(onRefresh: () => void, enabled = true, isFetching = false) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "r" && e.key !== "R") return;
      if (isTypingTarget(e.target)) return;
      if (isFetching) return;
      e.preventDefault();
      onRefresh();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, isFetching, onRefresh]);
}
