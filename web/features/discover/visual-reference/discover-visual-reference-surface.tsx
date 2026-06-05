"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, type KeyboardEvent, type MutableRefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import { VR_TABS, type VRTabId } from "./discover-visual-reference-tabs";
import { DISCOVER_STATIC_VIEW_MODEL, type DiscoverViewModel } from "./discover-view-model-adapter";
import { CreatorFaceRail, TopicChipBoard } from "./discover-creator-network";
import { MarketAtmosphereStack } from "./discover-market-strip";
import { DiscoverFeedSkeleton } from "./discover-feed-skeleton";
import { HomeStoriesSection } from "@/features/stories/home-stories-section";

const DiscoveryStream = dynamic(
  () => import("./discover-vr-sections").then((m) => m.DiscoveryStream),
  { loading: () => <DiscoverFeedSkeleton inline /> },
);

const LiveTabPreview = dynamic(
  () => import("./discover-vr-sections").then((m) => m.LiveTabPreview),
  { loading: () => <DiscoverFeedSkeleton inline /> },
);

const PulseTabPreview = dynamic(
  () => import("./discover-vr-sections").then((m) => m.PulseTabPreview),
  { loading: () => <DiscoverFeedSkeleton inline /> },
);

const VideosTabPreview = dynamic(
  () => import("./discover-vr-sections").then((m) => m.VideosTabPreview),
  { loading: () => <DiscoverFeedSkeleton inline /> },
);

const SignalsTabPreview = dynamic(
  () => import("./discover-vr-sections").then((m) => m.SignalsTabPreview),
  { loading: () => <DiscoverFeedSkeleton inline /> },
);

const CreatorsTabPreview = dynamic(
  () => import("./discover-vr-sections").then((m) => m.CreatorsTabPreview),
  { loading: () => <DiscoverFeedSkeleton inline /> },
);

const DISCOVER_PANEL_ID = "discover-feed-panel";

type TabTarget = VRTabId | "all";

const TAB_ORDER: TabTarget[] = ["all", ...VR_TABS.map((t) => t.id)];

function TabBar({
  active,
  onSelect,
  onSelectAll,
  tabRefs,
  onTabKeyDown,
}: {
  active: VRTabId | null;
  onSelect: (id: VRTabId) => void;
  onSelectAll: () => void;
  tabRefs: MutableRefObject<Partial<Record<TabTarget, HTMLButtonElement>>>;
  onTabKeyDown: (e: KeyboardEvent<HTMLButtonElement>, target: TabTarget) => void;
}) {
  return (
    <div
      className="dvr-tab-bar scrollbar-none overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Keşfet sekmeleri"
    >
      <button
        ref={(el) => {
          tabRefs.current.all = el ?? undefined;
        }}
        type="button"
        role="tab"
        id="discover-tab-all"
        aria-selected={active === null}
        aria-controls={DISCOVER_PANEL_ID}
        tabIndex={active === null ? 0 : -1}
        className={cn("dvr-tab", active === null && "dvr-tab--active")}
        onClick={onSelectAll}
        onKeyDown={(e) => onTabKeyDown(e, "all")}
        data-active={active === null}
      >
        Tümü
      </button>

      {VR_TABS.map((t) => (
        <button
          key={t.id}
          ref={(el) => {
            tabRefs.current[t.id] = el ?? undefined;
          }}
          type="button"
          role="tab"
          id={`discover-tab-${t.id}`}
          aria-selected={active === t.id}
          aria-controls={DISCOVER_PANEL_ID}
          tabIndex={active === t.id ? 0 : -1}
          className={cn("dvr-tab", active === t.id && "dvr-tab--active")}
          onClick={() => onSelect(t.id)}
          onKeyDown={(e) => onTabKeyDown(e, t.id)}
          data-active={active === t.id}
        >
          {t.id === "live" ? (
            <span className="dvr-live-tab-dot mr-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" aria-hidden />
          ) : null}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TabContent({ tab, vm }: { tab: VRTabId; vm: DiscoverViewModel }) {
  switch (tab) {
    case "live":
      return <LiveTabPreview vm={vm} />;
    case "pulse":
      return <PulseTabPreview vm={vm} />;
    case "videos":
      return <VideosTabPreview vm={vm} />;
    case "signals":
      return <SignalsTabPreview vm={vm} />;
    case "creators":
      return <CreatorsTabPreview vm={vm} />;
    default:
      return null;
  }
}

export type DiscoverVisualReferenceSurfaceProps = {
  viewModel?: DiscoverViewModel;
  feedLoading?: boolean;
  feedError?: boolean;
  feedEnabled?: boolean;
  onFeedRetry?: () => void;
  feedHasNextPage?: boolean;
  feedIsFetchingNextPage?: boolean;
  onFeedLoadMore?: () => void;
};

export function DiscoverVisualReferenceSurface({
  viewModel = DISCOVER_STATIC_VIEW_MODEL,
  feedLoading = false,
  feedError = false,
  feedEnabled = true,
  onFeedRetry,
  feedHasNextPage = false,
  feedIsFetchingNextPage = false,
  onFeedLoadMore,
}: DiscoverVisualReferenceSurfaceProps) {
  const vm = viewModel;
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const contentRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<TabTarget, HTMLButtonElement>>>({});

  useEffect(() => {
    if (rawTab === "shorts") {
      router.replace("/discover?tab=pulse", { scroll: false });
    }
  }, [rawTab, router]);

  const isValidTab = (t: string | null): t is VRTabId =>
    t !== null && t !== "shorts" && VR_TABS.some((vt) => vt.id === t);

  const activeTab: VRTabId | null = isValidTab(rawTab) ? rawTab : null;

  const scrollContentTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, []);

  const handleSelect = useCallback(
    (id: VRTabId) => {
      scrollContentTop();
      router.replace(`/discover?tab=${id}`, { scroll: false });
    },
    [router, scrollContentTop],
  );

  const handleSelectAll = useCallback(() => {
    scrollContentTop();
    router.replace("/discover", { scroll: false });
  }, [router, scrollContentTop]);

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, current: TabTarget) => {
      const idx = TAB_ORDER.indexOf(current);
      if (idx < 0) return;
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % TAB_ORDER.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      else return;
      e.preventDefault();
      const next = TAB_ORDER[nextIdx]!;
      tabRefs.current[next]?.focus();
      if (next === "all") handleSelectAll();
      else handleSelect(next);
    },
    [handleSelect, handleSelectAll],
  );

  const panelLabelId = activeTab === null ? "discover-tab-all" : `discover-tab-${activeTab}`;

  return (
    <div className="dvr-surface" aria-busy={feedLoading}>
      {feedLoading ? <span className="sr-only">Keşfet içeriği yükleniyor.</span> : null}
      {feedError ? (
        <span className="sr-only">Keşfet verisi yüklenemedi; örnek içerik gösteriliyor.</span>
      ) : null}
      {!feedEnabled && !feedLoading ? (
        <span className="sr-only">Canlı veri kaynağı kullanılamıyor; örnek içerik gösteriliyor.</span>
      ) : null}

      <header className="dvr-top-chrome">
        <div className="dvr-market-atmosphere">
          <MarketAtmosphereStack tickers={vm.marketTickers} />
        </div>

        <div className="dvr-sticky-bar">
          <div className="dvr-sticky-bar__inner">
            <TabBar
              active={activeTab}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              tabRefs={tabRefs}
              onTabKeyDown={onTabKeyDown}
            />
          </div>
          <div className="dvr-chrome-discovery" aria-label="Keşfet giriş katmanı">
            <HomeStoriesSection variant="discover" useStaticFallback={!feedEnabled && !feedLoading} />
            <TopicChipBoard compact chips={vm.marketTopicChips} />
            <CreatorFaceRail compact creators={vm.creatorItems} activityRows={vm.creatorActivityFeed} />
          </div>
        </div>
      </header>

      {feedError && onFeedRetry ? (
        <div className="dvr-error-banner" role="alert">
          <p className="dvr-error-banner__text">Keşfet akışı yüklenemedi. Örnek içerik gösteriliyor.</p>
          <button type="button" className="dvr-error-banner__retry" onClick={onFeedRetry}>
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div
        ref={contentRef}
        id={DISCOVER_PANEL_ID}
        role="tabpanel"
        aria-labelledby={panelLabelId}
        className="dvr-content"
        aria-live="polite"
      >
        {feedEnabled && feedLoading ? (
          <DiscoverFeedSkeleton inline />
        ) : (
          <div key={activeTab ?? "all"} className="motion-panel-crossfade">
            {activeTab === null ? <DiscoveryStream vm={vm} /> : <TabContent tab={activeTab} vm={vm} />}
          </div>
        )}

        {feedEnabled && feedHasNextPage ? (
          <>
            <InfiniteScrollSentinel
              enabled={!feedIsFetchingNextPage}
              onVisible={() => {
                if (!feedIsFetchingNextPage) onFeedLoadMore?.();
              }}
            />
            {feedIsFetchingNextPage ? (
              <p className="py-6 text-center text-[0.8125rem] text-[var(--color-meta)]" aria-live="polite">
                Yükleniyor…
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
