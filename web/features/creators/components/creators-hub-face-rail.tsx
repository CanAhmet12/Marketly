"use client";

import { useMemo } from "react";

import { useCreatorsHubFaceRows } from "@/features/creators/hooks/use-creators-hub-face-rows";
import {
  buildCreatorActivityFeedFromDirectory,
  mapDirectoryRowToVRCreator,
} from "@/features/creators/lib/map-creator-to-vr";
import { CreatorFaceRail } from "@/features/discover/visual-reference/discover-creator-network";
import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";

type Props = {
  compact?: boolean;
  label?: string;
  subtitle?: string;
  hideSeeAll?: boolean;
  limit?: number;
};

/** Keşfet chrome + hub — gerçek creators repository ile FaceRail */
export function CreatorsHubFaceRail({
  compact = false,
  label = "Piyasayı konuşanlar",
  subtitle = "Analistler ve yayıncılar — canlı ve trend akış",
  hideSeeAll = false,
  limit = 8,
}: Props) {
  const { rows, enabled, isLoading } = useCreatorsHubFaceRows(limit);

  const creators = useMemo(() => rows.map(mapDirectoryRowToVRCreator), [rows]);
  const activityRows = useMemo(() => buildCreatorActivityFeedFromDirectory(rows), [rows]);

  if (!enabled || isLoading || rows.length === 0) return null;

  return (
    <CreatorFaceRail
      compact={compact}
      label={label}
      subtitle={subtitle}
      seeAllHref={DISCOVER_VERTICAL_ROUTES.creators}
      hideSeeAll={hideSeeAll}
      creators={creators}
      activityRows={activityRows}
    />
  );
}
