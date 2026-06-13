"use client";

import { DiscoverCreatorsTabPreview } from "@/features/discover/tab-previews/discover-creators-tab-preview";
import type { CreatorDirectoryRow } from "@/features/creators/types";

type PreviewCounts = {
  total: number;
  live: number;
  rising: number;
};

type Props = {
  live: CreatorDirectoryRow[];
  rising: CreatorDirectoryRow[];
  directory: CreatorDirectoryRow[];
  forYou: CreatorDirectoryRow[];
  forYouHeadline: string;
  isForYouPersonalized?: boolean;
  counts: PreviewCounts;
};

/** @deprecated Keşfet üretici önizlemesi — `DiscoverCreatorsTabPreview` kullan */
export function CreatorsDiscoverPreview(props: Props) {
  return <DiscoverCreatorsTabPreview {...props} />;
}
