"use client";

import { useCreatorsDirectory } from "@/features/creators/hooks/use-creators-directory";
import { useCreatorsDirectorySlices } from "@/features/creators/hooks/use-creators-directory-slices";
import { useCreatorsPersonalized } from "@/features/creators/hooks/use-creators-personalized";
import type { CreatorsDirectoryParams } from "@/features/creators/hooks/use-creators-directory-params";

export const CREATORS_DISCOVER_PREVIEW_LIMITS = {
  live: 6,
  rising: 5,
  personalized: 3,
  directory: 5,
} as const;

const HUB_PARAMS: CreatorsDirectoryParams = {
  q: "",
  sort: "recommended",
  tab: "all",
  asset: null,
  specialty: null,
};

/** Keşfet `?tab=creators` — sınırlı önizleme dilimleri */
export function useCreatorsDiscoverPreview() {
  const { payload, query, enabled } = useCreatorsDirectory();
  const { liveAll, risingAll, filtered, counts } = useCreatorsDirectorySlices(payload, HUB_PARAMS);
  const personalized = useCreatorsPersonalized(payload);

  const live = liveAll.slice(0, CREATORS_DISCOVER_PREVIEW_LIMITS.live);
  const rising = risingAll.slice(0, CREATORS_DISCOVER_PREVIEW_LIMITS.rising);
  const directory = filtered.slice(0, CREATORS_DISCOVER_PREVIEW_LIMITS.directory);
  const forYou = personalized.creators.slice(0, CREATORS_DISCOVER_PREVIEW_LIMITS.personalized);

  const isLoading = enabled && query.isLoading && !payload;
  const isError = enabled && query.isError && !payload;

  return {
    payload,
    live,
    rising,
    directory,
    forYou,
    forYouHeadline: personalized.headline,
    isForYouPersonalized: personalized.isPersonalized,
    counts,
    isLoading,
    isError,
    enabled,
    refetch: query.refetch,
  };
}
