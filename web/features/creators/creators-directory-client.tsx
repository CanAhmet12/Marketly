"use client";

import { useMemo } from "react";

import { CreatorsCanvasShell } from "@/features/creators/components/creators-canvas-shell";
import {
  CreatorsDirectoryStream,
  CreatorsDirectoryStreamColumn,
  CreatorsDirectoryStreamFull,
} from "@/features/creators/components/creators-directory-stream";
import { CreatorsDirectorySkeleton } from "@/features/creators/components/creators-directory-skeleton";
import { CreatorsDirectoryState } from "@/features/creators/components/creators-directory-states";
import { CreatorsIntelligenceDeck } from "@/features/creators/components/creators-intelligence-deck";
import { CreatorsContextRail } from "@/features/creators/components/creators-context-rail";
import { useCreatorsDirectory } from "@/features/creators/hooks/use-creators-directory";
import { useCreatorsPersonalized } from "@/features/creators/hooks/use-creators-personalized";
import { useCreatorsDirectoryParams } from "@/features/creators/hooks/use-creators-directory-params";
import { useCreatorsDirectorySlices } from "@/features/creators/hooks/use-creators-directory-slices";
import { hasActiveCreatorFilters } from "@/features/creators/lib/filter-creators-directory";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function CreatorsDirectoryClient() {
  const { params, replace, activeFilterCount } = useCreatorsDirectoryParams();
  const { payload, query, enabled } = useCreatorsDirectory(params.sort);
  const { filtered, featured, live, rising, counts } = useCreatorsDirectorySlices(payload, params);
  const {
    creators: personalizedCreators,
    headline: personalizedHeadline,
    isPersonalized,
  } = useCreatorsPersonalized(payload);

  const mockOn = isMockDataEnabled();
  const showSetup = !mockOn && !isSupabaseConfigured();
  const hasActiveFilters = hasActiveCreatorFilters(params, activeFilterCount);
  const isLoading = enabled && query.isLoading && !payload;
  const isError = enabled && query.isError && !payload;

  const topAccuracy = useMemo(
    () =>
      [...(payload?.creators ?? [])]
        .filter((c) => c.signalAccuracy != null && c.signalAccuracy > 0)
        .sort((a, b) => (b.signalAccuracy ?? 0) - (a.signalAccuracy ?? 0)),
    [payload?.creators],
  );

  const listKey = `${params.q}|${params.sort}|${params.tab}|${params.asset}|${params.specialty}`;

  if (showSetup) {
    return (
      <CreatorsCanvasShell headless>
        <CreatorsDirectoryState variant="no-config" />
      </CreatorsCanvasShell>
    );
  }

  if (isLoading) {
    return (
      <CreatorsCanvasShell headless>
        <CreatorsDirectorySkeleton />
      </CreatorsCanvasShell>
    );
  }

  return (
    <CreatorsCanvasShell headless>
      <h1 className="sr-only">Üreticiler — analist ve içerik üreticisi keşfi</h1>

      <CreatorsIntelligenceDeck counts={counts} />

      <div className="crt-canvas__body">
        <div className="crt-canvas__main">
          <CreatorsContextRail
            className="crt-canvas__context-rail--mobile"
            live={live}
            topAccuracy={topAccuracy}
            rising={rising}
            activeAsset={params.asset}
            onAssetPick={(asset) => replace({ asset: params.asset === asset ? null : asset })}
          />

          {isError && !mockOn ? (
            <CreatorsDirectoryState variant="error" onRetry={() => void query.refetch()} />
          ) : (
            <>
              <div className="crt-canvas__stream-desktop-col">
                <CreatorsDirectoryStreamColumn
                  key={`${listKey}-col`}
                  filtered={filtered}
                  featured={featured}
                  live={live}
                  rising={rising}
                  personalized={personalizedCreators}
                  personalizedHeadline={personalizedHeadline}
                  isPersonalized={isPersonalized}
                  activeTab={params.tab}
                  hasActiveFilters={hasActiveFilters}
                  refining={query.isFetching && Boolean(payload)}
                />
              </div>
              <div className="crt-canvas__stream-mobile-only">
                <CreatorsDirectoryStream
                  key={listKey}
                  filtered={filtered}
                  featured={featured}
                  live={live}
                  rising={rising}
                  personalized={personalizedCreators}
                  personalizedHeadline={personalizedHeadline}
                  isPersonalized={isPersonalized}
                  activeTab={params.tab}
                  hasActiveFilters={hasActiveFilters}
                  refining={query.isFetching && Boolean(payload)}
                />
              </div>
            </>
          )}
        </div>

        <aside className="crt-canvas__aside">
          <CreatorsContextRail
            live={live}
            topAccuracy={topAccuracy}
            rising={rising}
            activeAsset={params.asset}
            onAssetPick={(asset) => replace({ asset: params.asset === asset ? null : asset })}
          />
        </aside>

        {!isError ? (
          <div className="crt-canvas__stream-desktop-full">
            <CreatorsDirectoryStreamFull
              key={`${listKey}-full`}
              filtered={filtered}
            featured={featured}
            live={live}
            rising={rising}
            personalized={personalizedCreators}
            personalizedHeadline={personalizedHeadline}
            isPersonalized={isPersonalized}
            activeTab={params.tab}
            hasActiveFilters={hasActiveFilters}
            refining={query.isFetching && Boolean(payload)}
            />
          </div>
        ) : null}
      </div>
    </CreatorsCanvasShell>
  );
}
