"use client";

import { useDiscoverViewModel } from "@/features/discover/hooks/use-discover-view-model";
import { DiscoverVerticalPageShell } from "@/features/discover/pages/discover-vertical-page-shell";
import { LiveFullPageContent } from "@/features/discover/visual-reference/discover-vr-sections";
import { LiveListSkeleton } from "@/features/discover/visual-reference/live-list-skeleton";

export function LivePageClient() {
  const { viewModel, feedLoading, feedError, refetchFeed } = useDiscoverViewModel();

  return (
    <DiscoverVerticalPageShell
      title="Canlı Yayınlar"
      description="Şu an yayında olan analist ve piyasa masaları — gerçek zamanlı broadcast keşfi."
      viewModel={viewModel}
      feedLoading={feedLoading}
      feedError={feedError}
      onFeedRetry={refetchFeed}
      liveDot
    >
      {feedLoading ? <LiveListSkeleton inline /> : <LiveFullPageContent vm={viewModel} />}
    </DiscoverVerticalPageShell>
  );
}
