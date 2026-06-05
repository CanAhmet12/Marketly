"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AlertCallout } from "@/components/shared/alert-callout";
import { CreatorsActiveFilters } from "@/features/creators/components/creators-active-filters";
import { CreatorsAssetSections } from "@/features/creators/components/creators-asset-sections";
import { CreatorsFeaturedRow } from "@/features/creators/components/creators-featured-row";
import { CreatorsFilterBar } from "@/features/creators/components/creators-filter-bar";
import { CreatorsLiveStrip } from "@/features/creators/components/creators-live-strip";
import { CreatorsPageShell } from "@/features/creators/components/creators-page-shell";
import { CreatorsPageSkeleton } from "@/features/creators/components/creators-page-skeleton";
import { CreatorsResultsGrid } from "@/features/creators/components/creators-results-grid";
import { CreatorsRisingRow } from "@/features/creators/components/creators-rising-row";
import {
  DEFAULT_CREATOR_FILTERS,
  creatorFiltersFromSearchParams,
  creatorFiltersToSearchParams,
  type CreatorFilters,
} from "@/features/creators/creators-filters";
import { computeCreatorFacetCounts } from "@/features/creators/lib/compute-facet-counts";
import { filtersAreDefault, groupCreatorsByAsset } from "@/features/creators/lib/filter-and-sort-creators";
import { pickRisingCreators } from "@/features/creators/lib/pick-rising-creators";
import { useCreatorsDirectory } from "@/features/creators/hooks/use-creators-directory";

export function CreatorsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => creatorFiltersFromSearchParams(searchParams), [searchParams]);
  const [qDraft, setQDraft] = useState(filters.q);
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => setQDraft(filters.q), [filters.q]);

  const { query, payload, filtered, featured, liveNow, viewerId } = useCreatorsDirectory(filters);

  const pushFilters = useCallback(
    (next: CreatorFilters) => {
      const sp = creatorFiltersToSearchParams(next);
      const qs = sp.toString();
      router.replace(qs ? `/creators?${qs}` : "/creators", { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (qDraft !== filters.q) pushFilters({ ...filters, q: qDraft });
    }, 320);
    return () => window.clearTimeout(t);
  }, [qDraft, filters, pushFilters]);

  useEffect(() => {
    setIsRefining(true);
    const t = window.setTimeout(() => setIsRefining(false), 180);
    return () => window.clearTimeout(t);
  }, [filters]);

  const onChangeFilters = useCallback(
    (next: CreatorFilters) => {
      if (next.q !== qDraft) {
        setQDraft(next.q);
        return;
      }
      pushFilters({ ...next, q: qDraft });
    },
    [qDraft, pushFilters],
  );

  const onReset = useCallback(() => {
    setQDraft("");
    pushFilters(DEFAULT_CREATOR_FILTERS);
  }, [pushFilters]);

  const facetCounts = useMemo(() => {
    if (!payload) {
      return {
        format: { all: 0, live: 0, signal: 0, video: 0, pulse: 0 },
        asset: {},
        tier: { all: 0, pro: 0, elite: 0, new: 0 },
        scopeFollowing: 0,
      };
    }
    return computeCreatorFacetCounts(payload.creators, { ...filters, q: qDraft }, viewerId);
  }, [payload, filters, qDraft, viewerId]);

  const showSections = filtersAreDefault(filters) && payload;
  const assetGroups = useMemo(
    () => (payload ? groupCreatorsByAsset(payload.creators, payload.assetPresets) : []),
    [payload],
  );

  const rising = useMemo(() => {
    if (!payload || !showSections) return [];
    return pickRisingCreators(payload.creators, payload.featuredIds);
  }, [payload, showSections]);

  const featuredVisible = showSections ? featured : [];
  const liveVisible = showSections ? liveNow : liveNow.filter((c) => filtered.some((f) => f.id === c.id));
  const gridTitle = showSections ? "Tüm üreticiler" : `Sonuçlar (${filtered.length})`;

  if (query.isPending && !payload) {
    return <CreatorsPageSkeleton />;
  }

  if (query.isError && !payload) {
    return (
      <CreatorsPageShell>
        <AlertCallout
          tone="danger"
          title="Üreticiler yüklenemedi"
          primaryAction={{ label: "Tekrar dene", onClick: () => void query.refetch() }}
        >
          Bağlantını kontrol edip tekrar dene.
        </AlertCallout>
      </CreatorsPageShell>
    );
  }

  return (
    <CreatorsPageShell>
      <div className="creators-page__controls">
        <CreatorsFilterBar
          filters={{ ...filters, q: qDraft }}
          resultCount={filtered.length}
          facetCounts={facetCounts}
          onChange={onChangeFilters}
          onReset={onReset}
        />
        <CreatorsActiveFilters filters={{ ...filters, q: qDraft }} onChange={onChangeFilters} onReset={onReset} />
      </div>

      <div className={isRefining ? "creators-page__body creators-page__body--refining" : "creators-page__body"}>
        <CreatorsLiveStrip creators={liveVisible} />

        {showSections ? <CreatorsFeaturedRow creators={featuredVisible} /> : null}

        {showSections ? <CreatorsRisingRow creators={rising} /> : null}

        {showSections && assetGroups.length ? <CreatorsAssetSections groups={assetGroups} /> : null}

        <CreatorsResultsGrid creators={filtered} title={gridTitle} onReset={onReset} isRefining={isRefining} />
      </div>
    </CreatorsPageShell>
  );
}
