"use client";

import { useRef } from "react";

type QuerySurface = {
  data: unknown;
  isPending: boolean;
  isError: boolean;
};

/** İlk yükleme dışında skeleton/null döngüsünü engeller. */
export function useDetailSectionSurface<T>(query: QuerySurface & { data: T | undefined }) {
  const hydratedRef = useRef(false);
  const settledRef = useRef(false);
  const failedRef = useRef(false);

  if (query.data != null) {
    hydratedRef.current = true;
    settledRef.current = true;
    failedRef.current = false;
  }

  if (!query.isPending) {
    settledRef.current = true;
    if (query.isError && query.data == null) failedRef.current = true;
  }

  return {
    data: query.data,
    showInitialSkeleton:
      query.isPending && query.data == null && !settledRef.current && !failedRef.current,
    showUnavailableStub:
      query.data == null &&
      !hydratedRef.current &&
      (failedRef.current || (settledRef.current && !query.isPending)),
    hasHydrated: hydratedRef.current,
  };
}
