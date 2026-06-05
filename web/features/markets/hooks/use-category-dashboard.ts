"use client";

import { useMemo } from "react";

import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import type { LiveCategoryBuildResult } from "@/features/markets/lib/live-category/live-category-zones";
import { LIVE_ZONES_ALL, LIVE_ZONES_NONE, type LiveCategoryZones } from "@/features/markets/lib/live-category/live-category-zones";
import { getMarketsRepository } from "@/features/markets/repository";
import type { MarketsRepository } from "@/features/markets/repository/markets-repository";
import type { MarketAssetView } from "@/features/markets/types";
import { isMockDataEnabled } from "@/mock/config";

type BuildFn<T> = (assets: readonly MarketAssetView[]) => LiveCategoryBuildResult<T> | null;
type MockFn<T> = (repo: MarketsRepository) => T | null;

export function useCategoryDashboard<T>(mockFn: MockFn<T>, buildFn: BuildFn<T>) {
  const mockOn = isMockDataEnabled();
  const repo = useMemo(() => getMarketsRepository(), []);
  const { assets, isLoading, error } = useMarketAssetsLive();

  const mockData = useMemo(() => (mockOn ? mockFn(repo) : null), [mockOn, mockFn, repo]);

  const liveBuilt = useMemo(
    () => (!mockOn ? buildFn(assets) : null),
    [mockOn, buildFn, assets],
  );

  const data = mockOn ? mockData : liveBuilt?.dashboard ?? null;
  const zones: LiveCategoryZones = mockOn ? LIVE_ZONES_ALL : liveBuilt?.zones ?? LIVE_ZONES_NONE;

  return {
    mockOn,
    data,
    zones,
    isLoading: !mockOn && isLoading,
    hasGlobalAssets: assets.length > 0,
    fetchError: !mockOn && Boolean(error),
  };
}
