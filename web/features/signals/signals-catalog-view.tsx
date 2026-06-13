"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SKELETON_SHOW_DELAY_MS } from "@/components/states/delayed-skeleton";
import { SignalsCatalogSkeleton, SignalsStreamRefiningSkeleton } from "@/features/signals/components/signals-catalog-skeleton";
import { SignalsCatalogState } from "@/features/signals/components/signals-catalog-state";
import { useAuth } from "@/features/auth/use-auth";
import { SignalDetailModal } from "@/features/signals/components/signal-detail-modal";
import { SignalsEngagementProvider } from "@/features/signals/contexts/signals-engagement-context";
import { SignalsCanvasShell } from "@/features/signals/components/signals-canvas-shell";
import {
  SignalsIntelligenceDeck,
  SignalsIntelligenceDeckSkeleton,
} from "@/features/signals/components/signals-intelligence-deck";
import {
  SignalsDiscoveryStreamColumn,
  SignalsDiscoveryStreamFull,
} from "@/features/signals/components/signals-discovery-stream";
import { SignalsFilterBar } from "@/features/signals/components/signals-filter-bar";
import { SIGNAL_MARKET_SECTIONS } from "@/features/signals/components/signals-market-sections";
import { logSignalInteraction } from "@/features/signals/fetch-signal-recommendations";
import { useSignalRecommendations } from "@/features/signals/hooks/use-signal-recommendations";
import { useSignalById } from "@/features/signals/hooks/use-signal-by-id";
import { useSignalsCatalog } from "@/features/signals/hooks/use-signals-catalog";
import { buildLiveSignalsMarketplaceRails } from "@/features/signals/lib/build-live-signals-marketplace-rails";
import { computeSignalFacetCounts } from "@/features/signals/lib/compute-signal-facet-counts";
import { filterSignalFeed } from "@/features/signals/lib/filter-feed";
import { pickFeaturedRails } from "@/features/signals/lib/pick-featured-rails";
import type { SignalsFeedScope } from "@/features/signals/fetch-signals-feed";
import { useSignalsArchiveCount } from "@/features/signals/hooks/use-signals-archive-count";
import { useSignalsRealtime } from "@/features/signals/hooks/use-signals-realtime";
import { buildSignalsRouteUrl, signalsScopeFromSearchParams, type SignalsRouteContext } from "@/features/signals/lib/signals-route-url";
import { buildSignalsMarketplaceRails } from "@/features/signals/lib/signals-marketplace-build";
import { getSignalRecommendationsCache } from "@/features/signals/signal-recommendations-cache";
import {
  DEFAULT_SIGNAL_FILTERS,
  signalFiltersFromSearchParams,
} from "@/features/signals/signals-filters";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import type { MarketAssetCategory } from "@/features/markets/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { AlgoFlags } from "@/lib/algo-flags";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function activeMarketFromChips(chips: Set<string>): MarketAssetCategory | "all" {
  for (const section of SIGNAL_MARKET_SECTIONS) {
    if (chips.has(section.id)) return section.id;
  }
  return "all";
}

type Props = {
  routeContext?: SignalsRouteContext;
};

export function SignalsCatalogView({ routeContext = "page" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pSnap = usePersonalizationSnapshot();
  const { user } = useAuth();
  const focusAsset = useMemo(() => {
    const raw = searchParams.get("asset") ?? searchParams.get("symbol");
    return raw?.trim().toUpperCase() || null;
  }, [searchParams]);

  const signalId = searchParams.get("signal")?.trim() || null;

  const filters = useMemo(() => signalFiltersFromSearchParams(searchParams), [searchParams]);
  const catalogScope = useMemo(() => signalsScopeFromSearchParams(searchParams), [searchParams]);
  const archiveCount = useSignalsArchiveCount();

  const feedQuery = useMemo(
    () => ({
      asset: focusAsset,
      direction: filters.direction,
      sort: filters.sort,
      scope: catalogScope,
    }),
    [focusAsset, filters.direction, filters.sort, catalogScope],
  );

  const { rows, hero, isLoading, isError, mockOn, supabaseOn, refetch } = useSignalsCatalog(feedQuery);
  useSignalRecommendations();

  const embed = routeContext === "discover-tab";
  const [isRefining, setIsRefining] = useState(false);
  const [showRefiningSkeleton, setShowRefiningSkeleton] = useState(false);

  const affinity = mockOn ? pSnap.affinity : null;
  const activeMarket = activeMarketFromChips(filters.chips);

  const navigate = useCallback(
    (
      next: typeof filters,
      asset: string | null = focusAsset,
      keepSignalId: string | null = signalId,
      scope: SignalsFeedScope = catalogScope,
    ) => {
      router.replace(buildSignalsRouteUrl(routeContext, next, asset, keepSignalId, scope), { scroll: false });
    },
    [router, routeContext, focusAsset, signalId, catalogScope],
  );

  const onScopeChange = useCallback(
    (scope: SignalsFeedScope) => navigate(filters, focusAsset, signalId, scope),
    [navigate, filters, focusAsset, signalId],
  );

  const onShowArchive = useCallback(() => onScopeChange("archive"), [onScopeChange]);

  const openDetail = useCallback(
    (row: SignalsFeedRow) => {
      router.replace(buildSignalsRouteUrl(routeContext, filters, focusAsset, row.id, catalogScope), { scroll: false });
    },
    [router, routeContext, filters, focusAsset, catalogScope],
  );

  const closeDetail = useCallback(() => {
    router.replace(buildSignalsRouteUrl(routeContext, filters, focusAsset, null, catalogScope), { scroll: false });
  }, [router, routeContext, filters, focusAsset, catalogScope]);

  const onResetAll = useCallback(() => {
    navigate(DEFAULT_SIGNAL_FILTERS, null);
  }, [navigate]);

  const onSelectMarket = useCallback(
    (category: MarketAssetCategory | "all") => {
      const next = new Set(filters.chips);
      for (const section of SIGNAL_MARKET_SECTIONS) next.delete(section.id);
      if (category !== "all") next.add(category);
      navigate({ ...filters, chips: next });
    },
    [filters, navigate],
  );

  const filtered = useMemo(
    () =>
      filterSignalFeed(
        rows,
        filters.chips,
        filters.analystId,
        filters.minConfidence,
        focusAsset,
        filters.direction,
        filters.sort,
        affinity,
      ),
    [rows, filters, focusAsset, affinity],
  );

  const featuredRails = useMemo(() => {
    if (!filtered.length) return [];
    const built = mockOn
      ? buildSignalsMarketplaceRails(filtered, affinity)
      : buildLiveSignalsMarketplaceRails(filtered, getSignalRecommendationsCache(user?.id ?? null));
    return pickFeaturedRails(built);
  }, [filtered, mockOn, affinity, user?.id]);

  const facetCounts = useMemo(
    () => computeSignalFacetCounts(rows, filters, focusAsset, affinity),
    [rows, filters, focusAsset, affinity],
  );

  useEffect(() => {
    if (!isRefining) {
      setShowRefiningSkeleton(false);
      return;
    }
    const timer = window.setTimeout(() => setShowRefiningSkeleton(true), SKELETON_SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isRefining]);

  const needsByIdFetch = Boolean(signalId && !rows.some((r) => r.id === signalId));
  const byIdQuery = useSignalById(signalId, needsByIdFetch);

  useEffect(() => {
    if (!signalId || isLoading) return;
    if (rows.some((r) => r.id === signalId)) return;
    if (byIdQuery.isFetching) return;
    if (byIdQuery.data) return;
    if (rows.length === 0 && !isError && !byIdQuery.isError) return;
    closeDetail();
  }, [signalId, isLoading, rows, isError, byIdQuery.isFetching, byIdQuery.data, byIdQuery.isError, closeDetail]);

  useEffect(() => {
    if (!signalId || !AlgoFlags.signalCollaborativeFilter || !isSupabaseConfigured()) return;
    void logSignalInteraction(getSupabaseBrowserClient(), signalId, "view");
  }, [signalId]);

  useEffect(() => {
    if (isLoading || rows.length === 0) return;
    if (filters.direction === "all") return;
    if ((facetCounts.direction[filters.direction] ?? 0) > 0) return;
    navigate({ ...filters, direction: "all" });
  }, [isLoading, rows.length, filters, facetCounts, navigate]);

  const detail = useMemo(() => {
    if (!signalId) return null;
    return rows.find((r) => r.id === signalId) ?? byIdQuery.data ?? null;
  }, [signalId, rows, byIdQuery.data]);

  const detailLoading = Boolean(signalId && !detail && (isLoading || byIdQuery.isFetching));

  const similar = useMemo(() => {
    if (!detail) return [];
    return rows.filter((r) => r.symbol === detail.symbol && r.id !== detail.id).slice(0, 4);
  }, [detail, rows]);

  const catalogHighConfCount = useMemo(
    () => rows.filter((r) => r.is_active && r.confidence >= 75).length,
    [rows],
  );

  const showHeroBento = rows.length > 0 && catalogScope === "live";

  const emptyCatalog = !isLoading && rows.length === 0;
  const showCatalog = !isLoading && rows.length > 0;
  const showToolbar = !isLoading;

  useSignalsRealtime(
    filtered.map((r) => r.id),
    supabaseOn && catalogScope === "live",
  );

  return (
    <SignalsEngagementProvider>
    <SignalsCanvasShell embed={embed} dataMarket={activeMarket}>
      <h1 className="sr-only">{embed ? "Keşfet — Sinyaller" : "Sinyal Pazarı"}</h1>

      {isLoading ? <SignalsIntelligenceDeckSkeleton /> : null}
      {showCatalog ? <SignalsIntelligenceDeck hero={hero} highConfCount={catalogHighConfCount} /> : null}

      {showToolbar ? (
          <div className="sp-controls sp-controls--flush">
            <SignalsFilterBar
              filters={filters}
              resultCount={filtered.length}
              facetCounts={facetCounts}
              scope={catalogScope}
              archiveCount={archiveCount}
              onScopeChange={onScopeChange}
              activeMarket={activeMarket}
              onSelectMarket={onSelectMarket}
              onChange={(next) => {
                setIsRefining(true);
                window.setTimeout(() => setIsRefining(false), 180);
                navigate(next);
              }}
              onReset={onResetAll}
            />
          </div>
        ) : null}

        {showCatalog && (showHeroBento || featuredRails.length > 0) ? (
          <div className="sig-canvas__upper-band">
            <SignalsDiscoveryStreamColumn
              catalogRows={rows}
              featuredRails={featuredRails}
              showHeroBento={showHeroBento}
              onOpen={openDetail}
            />
          </div>
        ) : null}

        {isLoading ? (
          <SignalsCatalogSkeleton embed={embed} bodyOnly={embed} />
        ) : emptyCatalog ? (
          <div className="sp-empty-wrap">
            <SignalsCatalogState
              variant={
                isError ? "error" : !mockOn && !supabaseOn ? "no-config" : catalogScope === "archive" ? "filtered" : "empty"
              }
              onRetry={isError ? () => void refetch() : undefined}
              onShowArchive={catalogScope === "live" ? onShowArchive : undefined}
              archiveCount={archiveCount}
              onReset={catalogScope === "archive" ? () => onScopeChange("live") : undefined}
            />
          </div>
        ) : (
          <div
            className={
              isRefining
                ? "sig-canvas__body sig-canvas__body--full sp-main-grid--refining"
                : "sig-canvas__body sig-canvas__body--full"
            }
          >
            {showRefiningSkeleton ? (
              <SignalsStreamRefiningSkeleton />
            ) : filtered.length === 0 ? (
              <SignalsCatalogState
                variant="filtered"
                onReset={onResetAll}
                onShowArchive={catalogScope === "live" ? onShowArchive : undefined}
                archiveCount={archiveCount}
                compact
              />
            ) : (
              <SignalsDiscoveryStreamFull
                key={`${activeMarket}-${filters.direction}-full`}
                rows={filtered}
                onOpen={openDetail}
                onSelectMarket={onSelectMarket}
              />
            )}
          </div>
        )}

      <SignalDetailModal
        open={Boolean(signalId) && (detail !== null || detailLoading)}
        row={detail}
        isLoading={detailLoading}
        similar={similar}
        catalog={rows}
        onClose={closeDetail}
        onOpenSignal={openDetail}
      />
    </SignalsCanvasShell>
    </SignalsEngagementProvider>
  );
}
