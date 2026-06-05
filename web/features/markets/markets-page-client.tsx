"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/states";
import { MarketAssetCard } from "@/features/markets/components/market-asset-card";
import { MarketsContextRail } from "@/features/markets/components/markets-context-rail";
import { MarketsDenseTable } from "@/features/markets/components/markets-dense-table";
import { MarketDetailDrawer } from "@/features/markets/components/market-detail-drawer";
import { MarketsFilterControl, trendingFromAssets } from "@/features/markets/components/markets-filter-chips";
import { MarketsHero } from "@/features/markets/components/markets-hero";
import { MarketsCommunityNetworkPanel } from "@/features/markets/components/markets-community-network-panel";
import { MarketsCreatorRoomsHint } from "@/features/markets/components/markets-creator-rooms-hint";
import { MarketsIntelligenceDeck } from "@/features/markets/components/markets-intelligence-deck";
import { MarketsSearchBar } from "@/features/markets/components/markets-search-bar";
import { MarketsTickerStrip } from "@/features/markets/components/markets-ticker-strip";
import { MarketsWatchlistSurface } from "@/features/markets/components/markets-watchlist-surface";
import { DiscussionDiscoveryIntelPanel } from "@/features/social/components/discussion-discovery-intel-panel";
import { HomeTopicCommunityRails } from "@/features/social/components/home-topic-community-rails";
import { MarketsGridSkeleton, MarketsOfflineBanner } from "@/features/markets/components/markets-states";
import { useMarketsSearch } from "@/features/markets/hooks/use-markets-search";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { useOnlineStatus } from "@/features/markets/hooks/use-online-status";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { applyMarketLens, applyMarketSegment, segmentAssetCounts } from "@/features/markets/lib/filter-assets";
import type { MarketAssetView, MarketLensId, MarketSegmentId } from "@/features/markets/types";
import { emptyMarketsIntelligenceSurface } from "@/features/markets/types/markets-intelligence";
import { getMarketsRepository } from "@/features/markets/repository";
import { isMockDataEnabled } from "@/mock/config";

export type MarketsPageClientProps = {
  /** `/markets/category/...` gibi rotalar için başlangıç segmenti */
  initialSegment?: MarketSegmentId;
};

export function MarketsPageClient({ initialSegment }: MarketsPageClientProps = {}) {
  const mockOn = isMockDataEnabled();
  const online = useOnlineStatus();
  const repo = useMemo(() => getMarketsRepository(), []);
  const { watchlist, pinned, hydrated, pendingSymbol, toggleWatch, togglePin, isWatched, isPinned } = useMarketsWatchlist(
    mockOn ? repo.getWatchlistSeed() : undefined,
  );
  const search = useMarketsSearch();
  const [segment, setSegment] = useState<MarketSegmentId>(initialSegment ?? "all");
  const [lens, setLens] = useState<MarketLensId>("none");
  const [detail, setDetail] = useState<MarketAssetView | null>(null);
  const [loading, setLoading] = useState(mockOn);

  useEffect(() => {
    setSegment(initialSegment ?? "all");
  }, [initialSegment]);

  const dashboard = useMemo(() => repo.getDashboardPayload(), [repo]);
  const { assets: liveAssets } = useMarketAssetsLive();
  // Canlı modda Supabase asset_prices verisi; mock modda repo'dan
  const assets = useMemo(
    () => (!mockOn && liveAssets.length > 0 ? liveAssets : (dashboard?.assets ?? [])),
    [mockOn, liveAssets, dashboard]
  );
  const hero = dashboard?.hero;
  const intelligence = dashboard?.intelligence ?? emptyMarketsIntelligenceSurface();

  const calendar = useMemo(() => repo.getEconomicCalendar(), [repo]);
  const newsStrip = useMemo(() => repo.getMarketNewsStrip(), [repo]);
  const portfolioStrip = useMemo(() => repo.getPortfolioStrip(), [repo]);
  const pulseChips = useMemo(() => repo.getMarketPulseChips(), [repo]);

  const watchCtx = useMemo(
    () => repo.getWatchlistMarketsContext(Array.from(watchlist), Array.from(pinned)),
    [repo, watchlist, pinned],
  );

  const communityBundle = useMemo(
    () => ({
      live: intelligence.liveConversation,
      community: intelligence.communityIntel,
      crossAssetChains: intelligence.crossAssetChains,
      socialMechanics: intelligence.discussionSocialMechanics,
    }),
    [intelligence],
  );

  const trending = useMemo(() => trendingFromAssets(assets, 6), [assets]);

  const segmentCounts = useMemo(() => {
    const c = segmentAssetCounts(assets);
    return { ...c, watchlist: watchlist.size };
  }, [assets, watchlist.size]);

  const segmentLine = intelligence.segmentNarratives[segment] ?? null;

  const filtered = useMemo(() => {
    let list = applyMarketSegment(assets, segment, watchlist);
    list = applyMarketLens(list, lens, watchlist, pinned);
    const q = search.query.trim().toLowerCase();
    if (q) {
      list = list.filter((a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    if (hydrated && lens === "none" && segment === "all" && !q) {
      list = [...list].sort((a, b) => Number(pinned.has(b.symbol)) - Number(pinned.has(a.symbol)));
    }
    return list;
  }, [assets, segment, lens, watchlist, pinned, search.query, hydrated]);

  const openDetail = useCallback((a: MarketAssetView) => setDetail(a), []);

  useEffect(() => {
    if (!mockOn) return;
    const t = window.setTimeout(() => setLoading(false), 480);
    return () => window.clearTimeout(t);
  }, [mockOn]);

  const watchlistEmpty = segment === "watchlist" && hydrated && watchlist.size === 0;
  const showSkeleton = loading && mockOn;
  const showFilterEmpty = !watchlistEmpty && !showSkeleton && filtered.length === 0;
  const showGrid = !watchlistEmpty && !showSkeleton && filtered.length > 0;

  if (!hero) {
    return (
      <div className="ms-page-wrapper ms-container-markets">
        <EmptyState title="Piyasa verisi hazır değil" description="Özet yüklenemedi." tone="market" />
      </div>
    );
  }

  return (
    <div className="markets-fluid-scope ms-page-wrapper min-w-0 overflow-x-hidden">
      <div className="markets-search-dim">
        <div className="relative z-[1] ms-container-markets min-w-0">
          {!online ? <MarketsOfflineBanner /> : null}

          <MarketsHero hero={hero} />

          {mockOn ? (
            <div className="mt-[var(--sp-3)] min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Tema toplulukları</p>
              <div className="mt-[var(--sp-2)]">
                <HomeTopicCommunityRails />
              </div>
              <div className="mt-[var(--sp-2)]">
                <MarketsCreatorRoomsHint />
              </div>
              <div className="mt-[var(--sp-2)]">
                <DiscussionDiscoveryIntelPanel compact />
              </div>
            </div>
          ) : null}

          <div className="mt-[var(--sp-4)] min-h-[96px] space-y-[var(--sp-4)]">
            <MarketsWatchlistSurface hydrated={hydrated} watchlistSize={watchlist.size} context={watchCtx} />

            <MarketsTickerStrip assets={assets} />

            <MarketsSearchBar
              assets={assets}
              trending={trending}
              query={search.query}
              setQuery={search.setQuery}
              open={search.open}
              setOpen={search.setOpen}
              recent={search.recent}
              pushRecent={search.pushRecent}
              clearRecent={search.clearRecent}
              highlight={search.highlight}
              setHighlight={search.setHighlight}
              resetHighlight={search.resetHighlight}
              onSelectAsset={openDetail}
            />

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Hızlı sembol</p>
              <div className="mt-[var(--sp-2)] flex flex-wrap gap-[var(--sp-2)]">
                {pulseChips.length === 0 ? (
                  <p className="text-[12px] text-[var(--color-meta)]">Kısayol verisi yok</p>
                ) : (
                  pulseChips.map((c) => (
                    <Link
                      key={c.label}
                      href={c.href}
                      className="rounded-full px-[var(--sp-3)] py-[var(--sp-2)] text-[12px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
                    >
                      {c.label}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {!mockOn && assets.length === 0 ? (
              <p className="text-[12px] font-medium leading-relaxed text-[var(--color-text-secondary)]">
                Canlı kotasyonlar kapalı. API bağlandığında bu panolar aynı düzenle dolar.
              </p>
            ) : null}

            <MarketsIntelligenceDeck intelligence={intelligence} />

            <MarketsCommunityNetworkPanel bundle={communityBundle} />

            <MarketsContextRail calendar={calendar} news={newsStrip} portfolio={portfolioStrip} />

            <MarketsFilterControl
              segment={segment}
              lens={lens}
              onSegment={setSegment}
              onLens={setLens}
              segmentCounts={segmentCounts}
              segmentHint={segmentLine}
            />

            {showSkeleton ? (
              <MarketsGridSkeleton />
            ) : watchlistEmpty ? (
              <EmptyState
                title="Takip listeniz boş"
                description="Sembol ekleyerek piyasa komutasında kişisel bağlam oluşturun."
                actionLabel="Takip listesine git"
                actionHref="/watchlist"
                tone="market"
              />
            ) : showFilterEmpty ? (
              <EmptyState
                title="Bu görünümde sonuç yok"
                description="Segment veya liste filtresini değiştirin."
                actionLabel="Sıfırla"
                onAction={() => {
                  setSegment("all");
                  setLens("none");
                }}
                tone="market"
                compact
              />
            ) : showGrid ? (
              <>
                <MarketsDenseTable
                  assets={filtered}
                  watchlisted={isWatched}
                  pendingSymbol={pendingSymbol}
                  onToggleWatch={toggleWatch}
                  onOpenDetail={openDetail}
                />
                <ul className="m-0 grid list-none grid-cols-1 gap-[var(--sp-3)] p-0 min-[900px]:hidden min-[520px]:grid-cols-2">
                  {filtered.map((a) => (
                    <li key={a.id} className="h-full">
                      <MarketAssetCard
                        asset={a}
                        watched={isWatched(a.symbol)}
                        pinned={isPinned(a.symbol)}
                        onToggleWatch={() => toggleWatch(a.symbol)}
                        onTogglePin={() => togglePin(a.symbol)}
                        onOpenDetail={() => openDetail(a)}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <p className="mt-[var(--sp-4)] text-center text-[11px] font-semibold text-[var(--color-meta)]">
            Son güncelleme: {new Date(hero.updatedAt).toLocaleString("tr-TR")}
            {mockOn ? " (mock)" : ""}
          </p>

          <MarketDetailDrawer open={detail !== null} asset={detail} onClose={() => setDetail(null)} />
        </div>
      </div>
    </div>
  );
}
