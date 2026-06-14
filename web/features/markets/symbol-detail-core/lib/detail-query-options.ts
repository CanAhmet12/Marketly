import { keepPreviousData } from "@tanstack/react-query";

/** Detay sayfası sorguları — arka planda yenile, UI'ı sıfırlama */
export function detailQueryOptions(refetchMs: number) {
  return {
    staleTime: Math.max(5_000, Math.floor(refetchMs / 2)),
    refetchInterval: refetchMs,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
    placeholderData: keepPreviousData,
    retry: 1,
  } as const;
}
