"use client";

import { useMemo } from "react";

import type { CreatorDirectoryRow } from "@/features/creators/types";
import { useCreatorsDirectory } from "@/features/creators/hooks/use-creators-directory";
import { useCreatorsDirectorySlices } from "@/features/creators/hooks/use-creators-directory-slices";

const HUB_PARAMS = {
  q: "",
  sort: "recommended" as const,
  tab: "all" as const,
  asset: null,
  specialty: null,
};

export function useCreatorsHubFaceRows(limit = 8) {
  const { payload, enabled, query } = useCreatorsDirectory();
  const { featuredAll, liveAll, filtered } = useCreatorsDirectorySlices(payload, HUB_PARAMS);

  const rows = useMemo(() => {
    const seen = new Set<string>();
    const ordered: CreatorDirectoryRow[] = [];
    for (const c of [...featuredAll, ...liveAll, ...filtered]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      ordered.push(c);
      if (ordered.length >= limit) break;
    }
    return ordered;
  }, [featuredAll, liveAll, filtered, limit]);

  return {
    rows,
    payload,
    enabled,
    isLoading: enabled && query.isLoading && !payload,
  };
}
