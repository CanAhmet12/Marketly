import type { Query } from "@tanstack/react-query";

/** İlk veri yüklemesi — arka plan refetch sayılmaz */
export function isBlockingQueryFetch(query: Query): boolean {
  const { fetchStatus, status } = query.state;
  return fetchStatus === "fetching" && status === "pending";
}

export const GLOBAL_PAGE_GATE = {
  /** Kısa hydration flash'ını filtrele */
  blockConfirmMs: 90,
  /** Loader göründüyse minimum süre (ms) */
  minVisibleMs: 280,
  /** Daha kısaysa loader hiç gösterilmez */
  flashSkipMs: 120,
  settleMs: 100,
  maxWaitMs: 14_000,
  exitAnimMs: 320,
} as const;
