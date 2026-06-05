/**
 * FAZ G Phase 6: Global Async UX Rules
 *
 * Premium async behavior standardı:
 * - Calm retry (aggressive retry değil)
 * - Predictable stale times
 * - Network-aware timeouts
 */

export const ASYNC_CONFIG = {
  /** Queries */
  queries: {
    staleTime: 60_000, // 1 minute — fresh enough
    gcTime: 10 * 60_000, // 10 minutes — aggressive cleanup değil
    retry: 1, // Bir kere retry — kullanıcıyı beklemeye zorlama
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 3000), // Exponential backoff (max 3s)
    refetchOnWindowFocus: false, // Distraction yok
  },

  /** Mutations */
  mutations: {
    retry: 0, // Mutation fail → kullanıcıya bildir, silent retry yok
    retryDelay: 0,
  },

  /** Network */
  network: {
    timeout: 15_000, // 15s — reasonable for slow networks
    slowThreshold: 3_000, // 3s üzeri → "slow network" indicator
  },

  /** Optimistic UI */
  optimistic: {
    rollbackDelay: 300, // Error time'dan sonra rollback animation
  },
} as const;

/**
 * Mutation type'a göre feedback strategy
 */
export type MutationFeedbackStrategy =
  | "optimistic" // Instant UI update, silent success
  | "inline" // Show pending state, inline success/error
  | "blocking"; // Block UI, show spinner

export function getMutationStrategy(type: string): MutationFeedbackStrategy {
  // Optimistic: Instant feel mutations (like, save, follow)
  if (type === "like" || type === "save" || type === "follow") return "optimistic";

  // Blocking: Critical mutations (upload, payment, delete)
  if (type === "upload" || type === "delete" || type === "payment") return "blocking";

  // Inline: Standard mutations (comment, settings)
  return "inline";
}
