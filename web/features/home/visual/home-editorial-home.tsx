"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/use-auth";
import {
  filterHomePosts,
  HOME_FEED_CHIP_IDS,
  isLegacyHomeToDiscoverChip,
  legacyChipToDiscoverTab,
  normalizeHomeChipParam,
  type HomeFeedChipId,
} from "@/features/feed/home-feed-filters";
import { useFeedEngagement } from "@/features/engagement/use-feed-engagement";
import { useHomeFeed } from "@/features/feed/use-home-feed";
import type { HomeFeedFetchMode } from "@/features/feed/fetch-home-feed";
import type { MarketAssetView } from "@/features/markets/types";
import { buildEditorialRailBundle } from "@/features/home/editorial/build-editorial-rail";
import { HomeEditorialFeedSkeleton } from "@/features/home/visual/home-editorial-feed-skeleton";
import { HomeEditorialFeedList } from "@/features/home/visual/home-editorial-feed-list";
import { HomeFeedMast } from "@/features/home/visual/home-feed-mast";
import { HomeFeedScrollTop } from "@/features/home/visual/home-feed-scroll-top";
import { HomeFeedState } from "@/features/home/visual/home-feed-states";
import { HomeFeedTodayStrip } from "@/features/home/visual/home-feed-today-strip";
import { HomeRailStickyShell } from "@/features/home/visual/home-rail-sticky-shell";
import { HomeVisualRightRail } from "@/features/home/visual/home-visual-right-rail";
import { useHomeEditorialChips } from "@/features/home/hooks/use-home-editorial-chips";
import {
  persistHomeFeedChip,
  useHomeFeedChipPersistence,
} from "@/features/home/hooks/use-home-feed-chip-persistence";
import { useHomeComposeShortcut } from "@/features/home/hooks/use-home-compose-shortcut";
import { useHomeFeedTabShortcut } from "@/features/home/hooks/use-home-feed-tab-shortcut";
import { useHomeRefreshShortcut } from "@/features/home/hooks/use-home-refresh-shortcut";
import { HomeFeedKeyboardHints } from "@/features/home/visual/home-feed-keyboard-hints";
import { useHomePullRefresh } from "@/features/home/hooks/use-home-pull-refresh";
import { HomeFeedCreatorSuggestions } from "@/features/home/visual/home-feed-creator-suggestions";
import { HomeFeedPullIndicator } from "@/features/home/visual/home-feed-pull-indicator";
import { useRecommendedCreators } from "@/features/home/hooks/use-recommended-creators";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useDiscussionRecommendations } from "@/features/social/hooks/use-discussion-recommendations";
import { mapDiscussionPackToRailLinks } from "@/features/social/lib/map-discussion-pack-to-rail";
import { useAffinitySync } from "@/features/personalization/hooks/use-affinity-sync";
import { AlgoFlags } from "@/lib/algo-flags";
import { useLiveRankContext } from "@/features/personalization/hooks/use-live-rank-context";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

const FEED_PANEL_ID = "home-feed-panel";

/**
 * Üretim ana akış — `hv-ref` görsel sistemi + gerçek repository / kişiselleştirme verisi.
 */
export function HomeEditorialHome() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chipParam = searchParams.get("chip");
  useHomeFeedChipPersistence(chipParam, router);
  const snap = usePersonalizationSnapshot();
  const { rev: liveRankRev } = useLiveRankContext(user?.id ?? null);
  useAffinitySync(user?.id ?? null);
  const { creators: recommendedCreators } = useRecommendedCreators();
  const { pack: discussionPack, rev: discussionRev } = useDiscussionRecommendations();
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
  const { posts, query, feedEnabled: homeFeedEnabled } = useHomeFeed(feedMode);
  const loginNext = chip === "following" ? "/?chip=following" : "/";
  const { handlers: engagement } = useFeedEngagement({ loginNext });

  const postsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<HomeFeedChipId, HTMLButtonElement>>>({});
  const prevPostCountRef = useRef(0);
  const [loadAnnouncement, setLoadAnnouncement] = useState("");

  const setChip = useCallback(
    (id: HomeFeedChipId) => {
      persistHomeFeedChip(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
  useHomeComposeShortcut(router, feedReady);
  const onFeedRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  useHomeFeedTabShortcut(chip, setChip, feedReady);
  useHomeRefreshShortcut(onFeedRefresh, feedReady, query.isFetching);

  const pullRefresh = useHomePullRefresh({
    onRefresh: onFeedRefresh,
    isFetching: query.isFetching,
    disabled: !feedReady || showSetupGrid,
  });

  const isLoading =
    homeFeedEnabled &&
    feedReady &&
    posts.length === 0 &&
    !query.isError &&
    (query.isLoading || (query.isPending && query.fetchStatus === "fetching"));
  const isError = query.isError;
  const isEmptyFeed =
    homeFeedEnabled && feedReady && query.isSuccess && posts.length === 0 && query.fetchStatus === "idle";

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
  }, [filtered, chip, user?.id, liveRankRev, snap.affinity.meta.eventCount, snap.intel.confidenceLabel, snap.feedbackRev, snap.explorationRev, snap.watchRev, snap.recommendRev, snap.adaptiveRev]);

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

  const rail = useMemo(() => {
    const bundle = buildEditorialRailBundle(
      snap.intel,
      recommendedCreators,
      { ...editorialChips, newsRows: mockOn ? [] : (editorialChips.newsRows ?? []) },
      mockOn ? undefined : liveMarketAssets,
    );
    if (!mockOn && AlgoFlags.discussionRecommendations && discussionPack) {
      const live = mapDiscussionPackToRailLinks(discussionPack);
      if (live.length > 0) return { ...bundle, discussions: live };
    }
    return bundle;
  }, [snap.intel, recommendedCreators, editorialChips, mockOn, liveMarketAssets, discussionPack, discussionRev]);

  // Feed kartlarında live asset context için lookup map
  const liveAssetMap = useMemo((): Map<string, MarketAssetView> | null => {
    if (mockOn || !liveMarketAssets.length) return null;
    const map = new Map<string, MarketAssetView>();
    for (const a of liveMarketAssets) {
      map.set(a.symbol.toUpperCase(), a);
    }
    return map;
  }, [mockOn, liveMarketAssets]);

  return (
    <div className="hv-ref" aria-busy={isLoading}>
      <div className="hv-ref__canvas">
        <div className="hv-ref__grid hv-ref__grid--composed">
          <div className="hv-ref__main">
            <div className="hv-ref__feed-col">
              <div className="hv-ref__feed-inner">
                <div className="hv-ref__stream">
                  <HomeFeedPullIndicator {...pullRefresh} />
                  <HomeFeedKeyboardHints enabled={feedReady && !showSetupGrid} />
                  <HomeFeedMast
                    chip={chip}
                    feedPanelId={FEED_PANEL_ID}
                    tabRefs={tabRefs}
                    isFetching={query.isFetching}
                    showSetupGrid={showSetupGrid}
                    onSetChip={setChip}
                    onTabKeyDown={onTabKeyDown}
                    onRefresh={onFeedRefresh}
                  />

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
                    <div key={chip} className="motion-feed-tab-enter">
                    {/* Market summary bar — bugünün en hareketli assetleri */}
                    {!isLoading && !showSetupGrid ? (
                      <HomeFeedTodayStrip items={editorialChips.today} />
                    ) : null}
                    {showSetupGrid ? <HomeFeedState variant="no-config" /> : null}

                    {feedReady && isError && !mockOn ? (
                      <HomeFeedState variant="error" onRetry={() => void query.refetch()} />
                    ) : null}

                    {feedReady && isLoading ? (
                      <HomeEditorialFeedSkeleton
                        inline
                        count={4}
                        showCreatorSuggest={chip === "following"}
                      />
                    ) : null}

                    {feedReady && !isLoading && isEmptyFeed && !mockOn ? (
                      <HomeFeedState variant="empty" />
                    ) : null}

                    {feedReady && !isLoading && chip === "following" && !user && isInitialized ? (
                      <HomeFeedState variant="following-login" loginHref={followingLoginHref} />
                    ) : null}

                    {feedReady && !isLoading && chip === "following" && user && posts.length === 0 ? (
                      <>
                        <HomeFeedState variant="following-empty" />
                        <HomeFeedCreatorSuggestions
                          creators={recommendedCreators}
                          viewerId={user?.id ?? null}
                        />
                      </>
                    ) : null}

                    {feedReady && !isLoading && forYouHiddenAll ? (
                      <HomeFeedState variant="feedback-filtered" />
                    ) : null}

                    {feedReady && !isLoading && isFilterEmpty ? (
                      <HomeFeedState variant="filtered" />
                    ) : null}

                    {feedReady && !isLoading && displayPosts.length > 0 ? (
                      <HomeEditorialFeedList
                        posts={displayPosts}
                        engagement={engagement}
                        hasNextPage={Boolean(query.hasNextPage)}
                        isFetchingNextPage={query.isFetchingNextPage}
                        onLoadMore={() => void query.fetchNextPage()}
                        assetMap={liveAssetMap}
                        tabKey={chip}
                      />
                    ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <HomeRailStickyShell>
            <HomeVisualRightRail
              shortcuts={rail.shortcuts}
              today={rail.today}
              interests={rail.interests}
              signals={rail.signals}
              discussions={rail.discussions}
              creators={rail.creators}
              categoryPreviews={rail.categoryPreviews}
              newsItems={rail.newsItems}
              liveAssets={mockOn ? [] : liveMarketAssets}
              viewerId={user?.id ?? null}
            />
          </HomeRailStickyShell>
        </div>
      </div>
      <HomeFeedScrollTop />
    </div>
  );
}
