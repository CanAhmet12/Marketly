import type { QueryClient } from "@tanstack/react-query";

/**
 * FAZ G Phase 6: Optimistic UI + Rollback Helpers
 *
 * Premium ürün: mutation anında hissedilmeli ama geri alınabilir olmalı.
 */

/**
 * Generic optimistic update with automatic rollback on error
 */
export function withOptimisticUpdate<TData, TContext>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updater: (old: TData | undefined) => TData,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error, context: TContext) => void;
  },
) {
  return {
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData>(queryKey);
      queryClient.setQueryData<TData>(queryKey, updater);
      return { previous } as TContext;
    },
    onError: (error: Error, _variables: unknown, context?: TContext) => {
      // Rollback to previous state
      if (context && typeof context === "object" && "previous" in context) {
        queryClient.setQueryData(queryKey, (context as { previous?: TData }).previous);
      }
      options?.onError?.(error, context as TContext);
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Optimistic toggle (like, save, follow)
 */
export function optimisticToggle<TItem extends { id: string }>(
  items: TItem[],
  itemId: string,
  field: keyof TItem,
  increment?: { field: keyof TItem; delta: number },
): TItem[] {
  return items.map((item) => {
    if (item.id !== itemId) return item;
    const updated = { ...item, [field]: !item[field] } as TItem;
    if (increment) {
      const current = Number(item[increment.field]) || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated as any)[increment.field] = Math.max(0, current + increment.delta);
    }
    return updated;
  });
}

/**
 * Delay for rollback animation (smooth revert)
 */
export function delayRollback(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
