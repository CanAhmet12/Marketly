"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ASYNC_CONFIG } from "@/lib/async/async-config";

type Props = {
  children: ReactNode;
};

export function QueryProvider({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: ASYNC_CONFIG.queries.staleTime,
            gcTime: ASYNC_CONFIG.queries.gcTime,
            retry: ASYNC_CONFIG.queries.retry,
            retryDelay: ASYNC_CONFIG.queries.retryDelay,
            refetchOnWindowFocus: ASYNC_CONFIG.queries.refetchOnWindowFocus,
          },
          mutations: {
            retry: ASYNC_CONFIG.mutations.retry,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
