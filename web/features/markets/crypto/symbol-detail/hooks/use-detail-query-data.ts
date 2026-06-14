"use client";

import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";
import { useRef } from "react";

type Options<T> = Omit<UseQueryOptions<T, Error, T, QueryKey>, "queryKey" | "queryFn"> & {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
};

function dataSignature(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** isFetching flip'lerinde re-render tetikleme — yalnızca data gerçekten değişince güncelle. */
export function useDetailQueryData<T>(options: Options<T>) {
  const cacheRef = useRef<T | undefined>(undefined);
  const sigRef = useRef("");

  const query = useQuery({
    ...options,
    notifyOnChangeProps: ["data", "error"],
  });

  const raw = query.data;
  if (raw !== undefined) {
    const sig = dataSignature(raw);
    if (sig !== sigRef.current) {
      sigRef.current = sig;
      cacheRef.current = raw;
    }
  }

  return {
    data: cacheRef.current,
    isPending: query.isPending,
    isError: query.isError,
    isFetching: query.isFetching,
  };
}
