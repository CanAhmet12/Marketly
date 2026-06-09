"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  normalizeCreatorAsset,
  normalizeCreatorSpecialty,
  normalizeCreatorsSort,
  normalizeCreatorsViewTab,
  type CreatorSpecialtyId,
  type CreatorsSortId,
  type CreatorsViewTab,
} from "@/features/creators/lib/creators-directory-config";

export type CreatorsDirectoryParams = {
  q: string;
  sort: CreatorsSortId;
  tab: CreatorsViewTab;
  asset: string | null;
  specialty: CreatorSpecialtyId | null;
};

function readParams(searchParams: URLSearchParams): CreatorsDirectoryParams {
  return {
    q: (searchParams.get("q") ?? "").trim(),
    sort: normalizeCreatorsSort(searchParams.get("sort")),
    tab: normalizeCreatorsViewTab(searchParams.get("tab")),
    asset: normalizeCreatorAsset(searchParams.get("asset")),
    specialty: normalizeCreatorSpecialty(searchParams.get("specialty")),
  };
}

function buildCreatorsDirectoryHref(base: CreatorsDirectoryParams, patch: Partial<CreatorsDirectoryParams>): string {
  const next = { ...base, ...patch };
  const sp = new URLSearchParams();
  if (next.q) sp.set("q", next.q);
  if (next.sort !== "recommended") sp.set("sort", next.sort);
  if (next.tab !== "all") sp.set("tab", next.tab);
  if (next.asset) sp.set("asset", next.asset);
  if (next.specialty) sp.set("specialty", next.specialty);
  const qs = sp.toString();
  return qs ? `/creators?${qs}` : "/creators";
}

export function useCreatorsDirectoryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(() => readParams(searchParams), [searchParams]);

  const replace = useCallback(
    (patch: Partial<CreatorsDirectoryParams>) => {
      router.replace(buildCreatorsDirectoryHref(params, patch), { scroll: false });
    },
    [params, router],
  );

  const clearFilters = useCallback(() => {
    router.replace("/creators", { scroll: false });
  }, [router]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (params.q) n += 1;
    if (params.asset) n += 1;
    if (params.specialty) n += 1;
    if (params.sort !== "recommended") n += 1;
    return n;
  }, [params]);

  return { params, replace, clearFilters, activeFilterCount };
}
