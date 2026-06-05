"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buildSearchUrl, tabGroupFromParam } from "@/features/search/lib/search-url";
import type { SearchTabGroupId } from "@/features/search/types";

const MIN_LEN = 2;

export function useSearchQuery() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawQ = (searchParams.get("q") ?? "").trim();
  const tab = tabGroupFromParam(searchParams.get("tab"));
  const canSearch = rawQ.length >= MIN_LEN;

  const replaceSearch = useCallback(
    (q: string, nextTab: SearchTabGroupId = "all") => {
      router.replace(buildSearchUrl(q, nextTab), { scroll: false });
    },
    [router],
  );

  const pushSearch = useCallback(
    (q: string, nextTab: SearchTabGroupId = "all") => {
      router.push(buildSearchUrl(q, nextTab));
    },
    [router],
  );

  const setTab = useCallback(
    (nextTab: SearchTabGroupId) => {
      router.replace(buildSearchUrl(rawQ, nextTab), { scroll: false });
    },
    [router, rawQ],
  );

  const clearQuery = useCallback(() => {
    router.replace("/results", { scroll: false });
  }, [router]);

  return useMemo(
    () => ({
      rawQ,
      tab,
      canSearch,
      minLen: MIN_LEN,
      replaceSearch,
      pushSearch,
      setTab,
      clearQuery,
    }),
    [rawQ, tab, canSearch, replaceSearch, pushSearch, setTab, clearQuery],
  );
}
