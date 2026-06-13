"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";

import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import { useNudgeLazyMediaWhenReady } from "@/hooks/use-nudge-lazy-media-when-ready";
import { resolveDiscoverTabRedirect } from "@/features/discover/lib/discover-hub-routes";
import { CreatorsHubFaceRail } from "@/features/creators/components/creators-hub-face-rail";
import { TopicChipBoard } from "./discover-creator-network";
import { MarketAtmosphereStack } from "./discover-market-strip";
import { DiscoverErrorBanner } from "./discover-error-banner";
import { DiscoverFeedFooter } from "./discover-feed-footer";
import { DiscoverFeedSkeleton } from "./discover-feed-skeleton";
import { DISCOVER_STATIC_VIEW_MODEL, type DiscoverViewModel } from "./discover-view-model-adapter";

const DiscoveryStream = dynamic(
  () => import("./discover-vr-sections").then((m) => m.DiscoveryStream),
  { loading: () => <DiscoverFeedSkeleton inline /> },
);

const DISCOVER_PANEL_ID = "discover-feed-panel";

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
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const pendingLegacyRedirect = Boolean(rawTab && resolveDiscoverTabRedirect(rawTab));
  const contentRef = useRef<HTMLDivElement>(null);

  useNudgeLazyMediaWhenReady(!feedLoading && !pendingLegacyRedirect, "all");

  if (pendingLegacyRedirect) {
    return <DiscoverFeedSkeleton inline />;
  }

  return (
    <div className="dvr-surface" aria-busy={feedLoading}>
      {feedLoading ? <span className="sr-only">Keşfet içeriği yükleniyor.</span> : null}
      {feedError ? (
        <span className="sr-only">Keşfet verisi yüklenemedi; içerik boş veya geçici olarak kullanılamıyor.</span>
      ) : null}
      {!feedEnabled && !feedLoading ? (
        <span className="sr-only">Canlı veri kaynağı kullanılamıyor; içerik şu an görüntülenemiyor.</span>
      ) : null}

      <header className="dvr-top-chrome">
        <div className="dvr-market-atmosphere">
          <MarketAtmosphereStack tickers={vm.marketTickers} />
        </div>

        <div className="dvr-sticky-bar">
          <div className="dvr-sticky-bar__inner dvr-sticky-bar__inner--all-only">
            <div className="dvr-tab-bar-wrap dvr-tab-bar-wrap--single">
              <div className="dvr-tab-bar dvr-tab-bar--single" role="tablist" aria-label="Keşfet görünümü">
                <span className="dvr-tab dvr-tab--active dvr-tab--static" role="tab" aria-selected="true">
                  <span className="dvr-tab__label">Tümü</span>
                </span>
              </div>
            </div>
          </div>
          <div className="dvr-chrome-discovery dvr-chrome-discovery--all-only" aria-label="Keşfet giriş katmanı">
            <TopicChipBoard compact chips={vm.marketTopicChips} />
            <CreatorsHubFaceRail compact />
          </div>
        </div>
      </header>

      {feedError && onFeedRetry ? <DiscoverErrorBanner onRetry={onFeedRetry} /> : null}

      <div
        ref={contentRef}
        id={DISCOVER_PANEL_ID}
        role="main"
        aria-label="Keşfet — Tümü akışı"
        className="dvr-content"
        aria-live="polite"
      >
        {feedEnabled && feedLoading ? (
          <DiscoverFeedSkeleton inline />
        ) : (
          <div className="motion-panel-crossfade">
            <DiscoveryStream vm={vm} />
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
            <DiscoverFeedFooter loading={feedIsFetchingNextPage} />
          </>
        ) : feedEnabled && !feedLoading && !feedError ? (
          <DiscoverFeedFooter showEnd />
        ) : null}
      </div>
    </div>
  );
}
