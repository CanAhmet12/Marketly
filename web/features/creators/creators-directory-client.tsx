"use client";

import { useMemo } from "react";

import { CreatorsDirectoryStream } from "@/features/creators/components/creators-directory-stream";
import { CreatorsMobileInsightStrip } from "@/features/creators/components/creators-mobile-insight-strip";
import { CreatorsDirectorySkeleton } from "@/features/creators/components/creators-directory-skeleton";
import { CreatorsDirectoryState } from "@/features/creators/components/creators-directory-states";
import { CreatorsFilterBar } from "@/features/creators/components/creators-filter-bar";
import { CreatorsPageShell } from "@/features/creators/components/creators-page-shell";
import { CreatorsRightRail } from "@/features/creators/components/creators-right-rail";
import { useCreatorsDirectory } from "@/features/creators/hooks/use-creators-directory";
import { useCreatorsDirectoryParams } from "@/features/creators/hooks/use-creators-directory-params";
import { useCreatorsDirectorySlices } from "@/features/creators/hooks/use-creators-directory-slices";
import { hasActiveCreatorFilters } from "@/features/creators/lib/filter-creators-directory";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function CreatorsDirectoryClient() {
  const { params, replace, clearFilters, activeFilterCount } = useCreatorsDirectoryParams();
  const { payload, query, enabled } = useCreatorsDirectory();
  const { filtered, featured, live, rising, counts } = useCreatorsDirectorySlices(payload, params);

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

  const listKey = `${params.q}|${params.sort}|${params.asset}|${params.specialty}`;

  if (showSetup) {
    return (
      <CreatorsPageShell>
        <div className="crt-v2-main">
          <CreatorsFilterBar
            params={params}
            onChange={replace}
            onClearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
          />
          <CreatorsDirectoryState variant="no-config" />
        </div>
      </CreatorsPageShell>
    );
  }

  if (isLoading) {
    return (
      <CreatorsPageShell>
        <CreatorsDirectorySkeleton inline />
      </CreatorsPageShell>
    );
  }

  return (
    <CreatorsPageShell>
      <div className="crt-v2-grid">
        <div className="crt-v2-main">
          <CreatorsFilterBar
            params={params}
            onChange={replace}
            onClearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
          />

          <CreatorsMobileInsightStrip
            topAccuracy={topAccuracy}
            totalCount={counts.total}
            liveCount={counts.live}
          />

          {isError && !mockOn ? (
            <CreatorsDirectoryState variant="error" onRetry={() => void query.refetch()} />
          ) : (
            <CreatorsDirectoryStream
              key={listKey}
              filtered={filtered}
              featured={featured}
              live={live}
              rising={rising}
              hasActiveFilters={hasActiveFilters}
              refining={query.isFetching && Boolean(payload)}
            />
          )}
        </div>

        <CreatorsRightRail
          live={live}
          topAccuracy={topAccuracy}
          rising={rising}
          totalCount={counts.total}
          liveCount={counts.live}
          activeAsset={params.asset}
          onAssetPick={(asset) => replace({ asset: params.asset === asset ? null : asset })}
        />
      </div>
    </CreatorsPageShell>
  );
}
