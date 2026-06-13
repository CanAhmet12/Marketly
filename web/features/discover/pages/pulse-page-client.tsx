"use client";

import { useDiscoverViewModel } from "@/features/discover/hooks/use-discover-view-model";
import { DiscoverVerticalPageShell } from "@/features/discover/pages/discover-vertical-page-shell";
import { PulseFullPageContent } from "@/features/discover/visual-reference/discover-vr-sections";
import { PulseListSkeleton } from "@/features/pulse/pulse-list-skeleton";

export function PulsePageClient() {
  // TikTok Stage 2: "pulse" tab — explorationGamma 0.62 (en yüksek yenilik), format bias pulse 1.12×
  const { viewModel, feedLoading, feedError, refetchFeed } = useDiscoverViewModel("pulse");

  return (
    <DiscoverVerticalPageShell
      title="Pulse"
      description="Kısa form piyasa yorumları — dikey akış, 60 saniyenin altında hızlı görüşler."
      viewModel={viewModel}
      feedLoading={feedLoading}
      feedError={feedError}
      onFeedRetry={refetchFeed}
      pageTone="pulse"
      headless
    >
      {feedLoading ? <PulseListSkeleton inline /> : <PulseFullPageContent vm={viewModel} />}
    </DiscoverVerticalPageShell>
  );
}
