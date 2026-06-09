"use client";

import { useEffect } from "react";

import { isTypingTarget } from "@/lib/keyboard-target";

type Router = { push: (href: string) => void };

/** Ana akışta `N` ile gönderi oluşturma sayfasına git. */
export function useHomeComposeShortcut(router: Router, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "n" && e.key !== "N") return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      router.push("/upload");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, router]);
}
