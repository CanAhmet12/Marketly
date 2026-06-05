"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import {
  filterHomePosts,
  HOME_FEED_CHIP_IDS,
  isLegacyHomeToDiscoverChip,
  legacyChipToDiscoverTab,
  normalizeHomeChipParam,
  type HomeFeedChipId,
} from "@/features/feed/home-feed-filters";
import { HomeGridPlaceholderCards } from "@/features/feed/home-feed-grid-placeholders";
import { useFeedEngagement } from "@/features/engagement/use-feed-engagement";
import { useHomeFeed } from "@/features/feed/use-home-feed";
import type { HomeFeedFetchMode } from "@/features/feed/fetch-home-feed";
import { buildEditorialMarketStripItems } from "@/features/home/editorial/build-market-strip-items";
import { buildEditorialRailBundle } from "@/features/home/editorial/build-editorial-rail";
import { HomeEditorialFeedSkeleton } from "@/features/home/visual/home-editorial-feed-skeleton";
import { HomeEditorialFeedList } from "@/features/home/visual/home-editorial-feed-list";
import { HomeStoriesSection } from "@/features/stories/home-stories-section";
import { HomeVisualMarketStrip } from "@/features/home/visual/home-visual-market-strip";
import { HomeVisualRightRail } from "@/features/home/visual/home-visual-right-rail";
import { useHomeEditorialChips } from "@/features/home/hooks/use-home-editorial-chips";
import { useRecommendedCreators } from "@/features/home/hooks/use-recommended-creators";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

function IconRefresh() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6M3 12a9 9 0 0 1 3 6.7M3 21v-6h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

const TAB_LABELS: Record<HomeFeedChipId, string> = {
  for_you: "Senin için",
  following: "Takip",
};

const FEED_PANEL_ID = "home-feed-panel";

/**
 * Üretim ana akış — `hv-ref` görsel sistemi + gerçek repository / kişiselleştirme verisi.
 */
export function HomeEditorialHome() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chipParam = searchParams.get("chip");
  const snap = usePersonalizationSnapshot();
  const { creators: recommendedCreators } = useRecommendedCreators();
  const { chips: editorialChips } = useHomeEditorialChips();
  const { assets: liveMarketAssets } = useMarketAssetsLive();

  useEffect(() => {
    if (chipParam === "videos") {
      router.replace("/discover?tab=videos", { scroll: false });
      return;
    }
    if (chipParam === "live") {
      router.replace("/discover?tab=live", { scroll: false });
      return;
    }
    if (chipParam === "pulse" || chipParam === "shorts") {
      router.replace("/discover?tab=pulse", { scroll: false });
      return;
    }
    if (chipParam && isLegacyHomeToDiscoverChip(chipParam)) {
      const tab = legacyChipToDiscoverTab(chipParam);
      router.replace(tab === "trending" ? "/discover" : `/discover?tab=${tab}`, { scroll: false });
    }
  }, [chipParam, router]);

  const chip: HomeFeedChipId = normalizeHomeChipParam(chipParam);
  const feedMode: HomeFeedFetchMode = chip;
  const { posts, query } = useHomeFeed(feedMode);
  const loginNext = chip === "following" ? "/?chip=following" : "/";
  const { handlers: engagement } = useFeedEngagement({ loginNext });

  const postsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<HomeFeedChipId, HTMLButtonElement>>>({});
  const prevPostCountRef = useRef(0);
  const [loadAnnouncement, setLoadAnnouncement] = useState("");

  const setChip = useCallback(
    (id: HomeFeedChipId) => {
      postsRef.current?.scrollTo({ top: 0 });
      if (id === "for_you") router.replace("/", { scroll: false });
      else router.replace(`/?chip=${id}`, { scroll: false });
    },
    [router],
  );

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, current: HomeFeedChipId) => {
      const idx = HOME_FEED_CHIP_IDS.indexOf(current);
      if (idx < 0) return;
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % HOME_FEED_CHIP_IDS.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + HOME_FEED_CHIP_IDS.length) % HOME_FEED_CHIP_IDS.length;
      else return;
      e.preventDefault();
      const nextId = HOME_FEED_CHIP_IDS[nextIdx]!;
      tabRefs.current[nextId]?.focus();
      setChip(nextId);
    },
    [setChip],
  );

  const configured = isSupabaseConfigured();
  const mockOn = isMockDataEnabled();
  const feedReady = mockOn || configured;
  const showSetupGrid = !mockOn && !configured;

  const isLoading = (!isInitialized && !mockOn) || (feedReady && query.isPending && !query.data);
  const isError = query.isError;
  const isEmptyFeed = isInitialized && feedReady && query.isSuccess && posts.length === 0 && !query.isFetching;

  const filtered = useMemo(() => filterHomePosts(posts, chip), [posts, chip]);
  const isFilterEmpty = !isLoading && posts.length > 0 && filtered.length === 0;

  const forYouRanked = useMemo(() => {
    if (chip !== "for_you") return null;
    void snap.affinity.meta.eventCount;
    void snap.intel.confidenceLabel;
    void snap.feedbackRev;
    void snap.explorationRev;
    void snap.watchRev;
    void snap.recommendRev;
    void snap.adaptiveRev;
    return getPersonalizationRepository().rankHomeFeedForYou(filtered, user?.id ?? null);
  }, [filtered, chip, user?.id, snap.affinity.meta.eventCount, snap.intel.confidenceLabel, snap.feedbackRev, snap.explorationRev, snap.watchRev, snap.recommendRev, snap.adaptiveRev]);

  const displayPosts = chip === "for_you" ? (forYouRanked ?? []) : filtered;
  const forYouHiddenAll = chip === "for_you" && filtered.length > 0 && displayPosts.length === 0;

  useEffect(() => {
    if (query.isFetchingNextPage) return;
    const prev = prevPostCountRef.current;
    const next = displayPosts.length;
    if (prev > 0 && next > prev) {
      setLoadAnnouncement(`${next - prev} gönderi daha yüklendi`);
    }
    prevPostCountRef.current = next;
  }, [displayPosts.length, query.isFetchingNextPage]);

  const followingLoginHref = `/auth/login?next=${encodeURIComponent("/?chip=following")}`;

  const marketItems = useMemo(
    () => buildEditorialMarketStripItems(mockOn ? undefined : liveMarketAssets),
    [mockOn, liveMarketAssets],
  );
  const rail = useMemo(
    () => buildEditorialRailBundle(snap.intel, recommendedCreators, editorialChips),
    [snap.intel, recommendedCreators, editorialChips],
  );

  return (
    <div className="hv-ref" aria-busy={isLoading}>
      <div className="hv-ref__canvas">
        <div className="hv-ref__grid hv-ref__grid--composed">
          <div className="hv-ref__main">
            <div className="hv-ref__feed-col">
              <div className="hv-ref__feed-inner">
                <div className="hv-ref__stream">
                  <div className="hv-ref__mast">
                    <header className="hv-ref__top" aria-label="Akış">
                      <span className="hv-ref__sr-only">Akış</span>
                      <div className="hv-ref__mast-head">
                        <div className="hv-ref__head-actions">
                          <div className="hv-ref__tabs" role="tablist" aria-label="Akış sekmeleri">
                            {HOME_FEED_CHIP_IDS.map((tabId) => (
                              <button
                                key={tabId}
                                ref={(el) => {
                                  tabRefs.current[tabId] = el ?? undefined;
                                }}
                                type="button"
                                role="tab"
                                id={`home-feed-tab-${tabId}`}
                                aria-selected={chip === tabId}
                                aria-controls={FEED_PANEL_ID}
                                tabIndex={chip === tabId ? 0 : -1}
                                className="hv-ref__tab"
                                data-active={chip === tabId}
                                onClick={() => setChip(tabId)}
                                onKeyDown={(e) => onTabKeyDown(e, tabId)}
                              >
                                {TAB_LABELS[tabId]}
                              </button>
                            ))}
                          </div>
                          <div className="hv-ref__toolbar">
                            <button
                              type="button"
                              className="hv-ref__icon-btn"
                              title="Yenile"
                              aria-label="Yenile"
                              disabled={query.isFetching}
                              onClick={() => void query.refetch()}
                            >
                              <IconRefresh />
                            </button>
                            <button type="button" className="hv-ref__icon-btn" title="Ayarlar" aria-label="Ayarlar" onClick={() => router.push("/settings")}>
                              <IconMore />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="hv-ref-strip-region">
                        <div className="hv-ref__strip-wrap">
                          <HomeVisualMarketStrip items={marketItems} />
                        </div>
                        <div className="hv-ref__stories-wrap">
                          <HomeStoriesSection useStaticFallback={showSetupGrid} />
                        </div>
                      </div>
                    </header>
                  </div>

                  <div
                    ref={postsRef}
                    id={FEED_PANEL_ID}
                    role="tabpanel"
                    aria-labelledby={`home-feed-tab-${chip}`}
                    className="hv-ref__posts"
                    aria-live="polite"
                  >
                    <span className="hv-ref__sr-only" aria-live="polite">
                      {loadAnnouncement}
                    </span>
                    <div key={chip} className="motion-panel-crossfade">
                    {showSetupGrid ? (
                      <div className="py-[var(--hv-s-6)]">
                        <HomeGridPlaceholderCards variant="no-config" />
                      </div>
                    ) : null}

                    {feedReady && isError && !mockOn ? (
                      <div className="max-w-[min(100%,36rem)] py-[var(--hv-s-6)]" role="alert">
                        <p className="text-[0.984375rem] font-semibold text-[var(--hv-text)]">Akış yüklenemedi</p>
                        <p className="mt-[var(--hv-s-2)] text-[var(--hv-text-3)]">
                          {query.error instanceof Error ? query.error.message : "Bilinmeyen hata"}
                        </p>
                        <button
                          type="button"
                          className="mt-[var(--hv-s-4)] rounded-md border border-[var(--hv-sep)] px-4 py-2 text-[var(--hv-text-2)]"
                          onClick={() => void query.refetch()}
                        >
                          Tekrar dene
                        </button>
                      </div>
                    ) : null}

                    {feedReady && isLoading ? <HomeEditorialFeedSkeleton inline count={4} /> : null}

                    {feedReady && !isLoading && isEmptyFeed && !mockOn ? (
                      <div className="py-[var(--hv-s-6)]">
                        <HomeGridPlaceholderCards variant="empty-feed" />
                      </div>
                    ) : null}

                    {feedReady && !isLoading && chip === "following" && !user && isInitialized ? (
                      <div className="py-[var(--hv-s-6)]">
                        <EmptyState
                          title="Takip akışı için giriş yapın"
                          description="Takip ettiğin üreticilerin gönderilerini görmek için hesabına giriş yap."
                          actionLabel="Giriş yap"
                          actionHref={followingLoginHref}
                          tone="social"
                          compact
                        />
                      </div>
                    ) : null}

                    {feedReady && !isLoading && chip === "following" && user && posts.length === 0 ? (
                      <div className="py-[var(--hv-s-6)]">
                        <EmptyState
                          title="Takip ettiğin üreticilerden henüz gönderi yok"
                          description="Keşfetten ilginç creator'ları bul ve takip et."
                          actionLabel="Keşfet"
                          actionHref="/discover?tab=creators"
                          tone="social"
                          compact
                        />
                      </div>
                    ) : null}

                    {feedReady && !isLoading && forYouHiddenAll ? (
                      <div className="py-[var(--hv-s-6)]">
                        <EmptyState
                          title="Geri bildirim akışı filtreledi"
                          description="Sessize alınan üreticiler veya gizlenen gönderiler nedeniyle liste boş olabilir."
                          actionLabel="Ayarlar"
                          actionHref="/settings"
                          tone="neutral"
                          compact
                        />
                      </div>
                    ) : null}

                    {feedReady && !isLoading && isFilterEmpty ? (
                      <div className="py-[var(--hv-s-6)]">
                        <EmptyState
                          title="Bu sekmede içerik yok"
                          description="Senin için sekmesine dönüp genel akışı görebilirsin."
                          actionLabel="Senin İçin"
                          actionHref="/?chip=for_you"
                          compact
                        />
                      </div>
                    ) : null}

                    {feedReady && !isLoading && displayPosts.length > 0 ? (
                      <HomeEditorialFeedList
                        posts={displayPosts}
                        engagement={engagement}
                        hasNextPage={Boolean(query.hasNextPage)}
                        isFetchingNextPage={query.isFetchingNextPage}
                        onLoadMore={() => void query.fetchNextPage()}
                      />
                    ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="hv-ref__rail-col hv-ref__rail-col--ambient" aria-label="Bağlam">
            <div className="hv-ref__rail-bridge">
              <HomeVisualRightRail
                shortcuts={rail.shortcuts}
                today={rail.today}
                interests={rail.interests}
                trending={rail.trending}
                creators={rail.creators}
                viewerId={user?.id ?? null}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
