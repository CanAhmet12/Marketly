"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/states";
import { SKELETON_SHOW_DELAY_MS } from "@/components/states/delayed-skeleton";
import { renderWindowVirtualList } from "@/components/ui/virtual-list-render";
import { SignalDetailModal } from "@/features/signals/components/signal-detail-modal";
import { SignalFeedCard } from "@/features/signals/components/signal-feed-card";
import { SignalsActiveFilters } from "@/features/signals/components/signals-active-filters";
import { SignalsFeedSkeleton } from "@/features/signals/components/signals-feed-skeleton";
import { SignalsFilterBar } from "@/features/signals/components/signals-filter-bar";
import { SignalsHero } from "@/features/signals/components/signals-hero";
import { SignalsMarketIntelStrip } from "@/features/signals/components/signals-market-intel-strip";
import { SignalsMarketplaceRails } from "@/features/signals/components/signals-marketplace-rails";
import { SignalsSidebar } from "@/features/signals/components/signals-sidebar";
import { useSignalsCatalog } from "@/features/signals/hooks/use-signals-catalog";
import { useSignalRecommendations } from "@/features/signals/hooks/use-signal-recommendations";
import { useSignalsSaved } from "@/features/signals/hooks/use-signals-saved";
import { logSignalInteraction } from "@/features/signals/fetch-signal-recommendations";
import { computeSignalFacetCounts } from "@/features/signals/lib/compute-signal-facet-counts";
import { filterSignalFeed } from "@/features/signals/lib/filter-feed";
import {
  DEFAULT_SIGNAL_FILTERS,
  signalFiltersFromSearchParams,
  signalFiltersToSearchParams,
} from "@/features/signals/signals-filters";
import type { SignalFilterChipId } from "@/features/signals/types";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { SIGNALS_FEED_CARD_ESTIMATE, useWindowVirtualList } from "@/hooks/use-virtual-list";
import { AlgoFlags } from "@/lib/algo-flags";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SignalsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pSnap = usePersonalizationSnapshot();
  const { rows, hero, marketIntel, leaderboardSections, rails, isLoading, isError, mockOn, supabaseOn, refetch } =
    useSignalsCatalog();
  useSignalRecommendations();

  const focusAsset = useMemo(() => {
    const raw = searchParams.get("asset") ?? searchParams.get("symbol");
    return raw?.trim().toUpperCase() || null;
  }, [searchParams]);

  const signalId = searchParams.get("signal")?.trim() || null;

  const filters = useMemo(() => signalFiltersFromSearchParams(searchParams), [searchParams]);
  const [isRefining, setIsRefining] = useState(false);
  const [showRefiningSkeleton, setShowRefiningSkeleton] = useState(false);
  const { toggle, isSaved } = useSignalsSaved();

  const affinity = mockOn ? pSnap.affinity : null;

  const pushFilters = useCallback(
    (next: typeof filters, asset: string | null = focusAsset, keepSignalId: string | null = signalId) => {
      const sp = signalFiltersToSearchParams(next, asset, keepSignalId);
      const qs = sp.toString();
      router.replace(qs ? `/signals?${qs}` : "/signals", { scroll: false });
    },
    [router, focusAsset, signalId],
  );

  const openDetail = useCallback(
    (row: SignalsFeedRow) => {
      const sp = signalFiltersToSearchParams(filters, focusAsset, row.id);
      router.replace(`/signals?${sp.toString()}`, { scroll: false });
    },
    [router, filters, focusAsset],
  );

  const closeDetail = useCallback(() => {
    const sp = signalFiltersToSearchParams(filters, focusAsset, null);
    const qs = sp.toString();
    router.replace(qs ? `/signals?${qs}` : "/signals", { scroll: false });
  }, [router, filters, focusAsset]);

  const onResetAll = useCallback(() => {
    pushFilters(DEFAULT_SIGNAL_FILTERS, null);
  }, [pushFilters]);

  const onClearFocusAsset = useCallback(() => {
    pushFilters(filters, null);
  }, [pushFilters, filters]);

  const toggleChip = useCallback(
    (id: SignalFilterChipId) => {
      const next = new Set(filters.chips);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      pushFilters({ ...filters, chips: next });
    },
    [filters, pushFilters],
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

  useEffect(() => {
    if (!signalId || isLoading) return;
    if (rows.some((r) => r.id === signalId)) return;
    if (rows.length === 0 && !isError) return;
    closeDetail();
  }, [signalId, isLoading, rows, isError, closeDetail]);

  useEffect(() => {
    if (!signalId || !AlgoFlags.signalCollaborativeFilter || !isSupabaseConfigured()) return;
    void logSignalInteraction(getSupabaseBrowserClient(), signalId, "view");
  }, [signalId]);

  useEffect(() => {
    if (isLoading || rows.length === 0) return;
    if (filters.direction === "all") return;
    if ((facetCounts.direction[filters.direction] ?? 0) > 0) return;
    pushFilters({ ...filters, direction: "all" });
  }, [isLoading, rows.length, filters, facetCounts, pushFilters]);

  const analysts = useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) => m.set(r.analyst.id, r.analyst.display));
    return [...m.entries()].map(([id, label]) => ({ id, label }));
  }, [rows]);

  const detail = useMemo(() => {
    if (!signalId) return null;
    return rows.find((r) => r.id === signalId) ?? null;
  }, [signalId, rows]);

  const similar = useMemo(() => {
    if (!detail) return [];
    return rows.filter((r) => r.symbol === detail.symbol && r.id !== detail.id).slice(0, 4);
  }, [detail, rows]);

  const shareRow = useCallback(async (row: SignalsFeedRow) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/signals/${encodeURIComponent(row.id)}`;
    const text = `${row.symbol} ${row.direction} · güven %${row.confidence}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Marketly sinyal", text, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text} ${url}`);
      }
    } catch {
      /* iptal */
    }
  }, []);

  const emptyCatalog = !isLoading && rows.length === 0;
  const showCatalog = !isLoading && rows.length > 0;
  const buyCount = rows.filter((r) => r.direction === "BUY").length;
  const sellCount = rows.filter((r) => r.direction === "SELL").length;
  const holdCount = rows.filter((r) => r.direction === "HOLD").length;

  const feedVirtual = useWindowVirtualList({
    count: filtered.length,
    itemHeight: SIGNALS_FEED_CARD_ESTIMATE,
  });

  return (
    <div className="sp-canvas ms-page-wrapper ms-container-markets min-w-0">
      <SignalsHero hero={hero} />

      {showCatalog ? (
        <SignalsMarketIntelStrip
          variant="compact"
          intel={marketIntel}
          buyCount={buyCount}
          sellCount={sellCount}
          holdCount={holdCount}
          updatedAt={hero.updatedAt}
        />
      ) : null}

      {showCatalog ? (
        <div className="sp-controls">
          <SignalsFilterBar
            filters={filters}
            resultCount={filtered.length}
            facetCounts={facetCounts}
            analysts={analysts}
            onChange={(next) => {
              setIsRefining(true);
              window.setTimeout(() => setIsRefining(false), 180);
              pushFilters(next);
            }}
            onReset={onResetAll}
          />
          <SignalsActiveFilters
            filters={filters}
            focusAsset={focusAsset}
            onChange={pushFilters}
            onClearFocusAsset={onClearFocusAsset}
            onReset={onResetAll}
          />
        </div>
      ) : null}

      {isLoading ? (
        <div className="sp-main-grid">
          <div className="sp-feed-col">
            <SignalsFeedSkeleton count={5} />
          </div>
        </div>
      ) : emptyCatalog ? (
        <div className="sp-empty-wrap">
          <EmptyState
            title={
              isError
                ? "Sinyal kataloğu yüklenemedi"
                : mockOn
                  ? "Mock sinyal verisi kapalı"
                  : !supabaseOn
                    ? "Supabase yapılandırması gerekli"
                    : "Henüz sinyal yok"
            }
            description={
              isError
                ? "Bağlantıyı kontrol edip tekrar deneyin."
                : mockOn
                  ? "NEXT_PUBLIC_USE_MOCK açık değil. Tasarım önizlemesi için mock bayrağını açın."
                  : !supabaseOn
                    ? "NEXT_PUBLIC_SUPABASE_URL ve anon key tanımlayın veya mock modunu açın."
                    : "İlk sinyaller yayınlandığında katalog burada görünecek."
            }
            actionLabel={isError ? "Tekrar dene" : "Keşfet"}
            actionHref={isError ? undefined : "/discover"}
            onAction={isError ? () => void refetch() : undefined}
            tone="market"
          />
        </div>
      ) : (
        <div className={isRefining ? "sp-main-grid sp-main-grid--refining" : "sp-main-grid"}>
          <div className="sp-feed-col">
            {rails.length > 0 ? (
              <div className="sp-rail-wrap">
                <SignalsMarketplaceRails rails={rails.slice(0, 1)} onOpen={openDetail} />
              </div>
            ) : null}

            <div className="sp-feed-count">
              <span className="sp-feed-count-label">Katalog</span>
              <span className="sp-feed-count-sub">{filtered.length} sinyal</span>
            </div>

            {showRefiningSkeleton ? (
              <SignalsFeedSkeleton count={4} />
            ) : filtered.length === 0 ? (
              <div className="sp-empty-wrap sp-empty-wrap--compact">
                <EmptyState
                  title="Filtrelere uyan sinyal yok"
                  description="Filtreleri sıfırlayın veya analist / güven aralığını genişletin."
                  actionLabel="Filtreleri temizle"
                  onAction={onResetAll}
                  tone="market"
                  compact
                />
              </div>
            ) : (
              <ul className="list-none p-0 m-0">
                {renderWindowVirtualList({
                  items: filtered,
                  enabled: feedVirtual.enabled,
                  virtualItems: feedVirtual.virtualItems,
                  totalSize: feedVirtual.totalSize,
                  getKey: (row) => row.id,
                  renderItem: (row) => (
                    <SignalFeedCard
                      row={row}
                      saved={isSaved(row.id)}
                      onToggleSave={() => toggle(row.id)}
                      onOpenDetail={() => openDetail(row)}
                      onShare={() => void shareRow(row)}
                    />
                  ),
                })}
              </ul>
            )}
          </div>

          <SignalsSidebar
            leaderboardSections={leaderboardSections}
            activeChips={filters.chips}
            onToggleChip={toggleChip}
            buyCount={buyCount}
            sellCount={sellCount}
            holdCount={holdCount}
          />
        </div>
      )}

      <SignalDetailModal
        open={detail !== null}
        row={detail}
        similar={similar}
        catalog={rows}
        onClose={closeDetail}
      />
    </div>
  );
}
