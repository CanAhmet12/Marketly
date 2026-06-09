"use client";

import { useMemo } from "react";

import type { CreatorsDirectoryParams } from "@/features/creators/hooks/use-creators-directory-params";
import { countCreators, pickFeaturedCreators, pickLiveCreators, pickRisingCreators } from "@/features/creators/lib/build-creators-directory-payload";
import { filterCreatorsDirectory } from "@/features/creators/lib/filter-creators-directory";
import type { CreatorDirectoryPayload } from "@/features/creators/types";

/** Tam sayfa + keşfet hub — ortak dilimleme */
export function useCreatorsDirectorySlices(
  payload: CreatorDirectoryPayload | null,
  params: CreatorsDirectoryParams,
) {
  const filtered = useMemo(
    () => (payload ? filterCreatorsDirectory(payload.creators, params) : []),
    [payload, params],
  );

  const featured = useMemo(() => {
    if (!payload) return [];
    const ids = new Set(payload.featuredIds);
    return filtered.filter((c) => ids.has(c.id));
  }, [payload, filtered]);

  const live = useMemo(() => filtered.filter((c) => c.isLive), [filtered]);
  const rising = useMemo(() => filtered.filter((c) => c.rising), [filtered]);
  const counts = useMemo(() => (payload ? countCreators(payload) : { total: 0, live: 0, rising: 0 }), [payload]);

  const featuredAll = useMemo(() => (payload ? pickFeaturedCreators(payload) : []), [payload]);
  const liveAll = useMemo(() => (payload ? pickLiveCreators(payload) : []), [payload]);
  const risingAll = useMemo(() => (payload ? pickRisingCreators(payload) : []), [payload]);

  return {
    filtered,
    featured,
    live,
    rising,
    counts,
    featuredAll,
    liveAll,
    risingAll,
  };
}
