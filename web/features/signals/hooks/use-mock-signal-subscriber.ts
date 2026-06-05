"use client";

import { useSyncExternalStore } from "react";
import { isMockDataEnabled } from "@/mock/config";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("marketly_mock_signal_subscriber") === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * `localStorage.marketly_mock_signal_subscriber = "1"` — mock abonelik.
 * MC-004: Mock kapalıyken her zaman `false` döner; localStorage'dan etkilenmez.
 */
export function useMockSignalSubscriber(): boolean {
  const liveValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // MC-004: mock guard — live modda mock subscriber devre dışı
  return isMockDataEnabled() ? liveValue : false;
}
