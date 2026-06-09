"use client";

import { useDiscoverViewModel } from "@/features/discover/hooks/use-discover-view-model";
import { DiscoverVerticalPageShell } from "@/features/discover/pages/discover-vertical-page-shell";
import { VideosFullPageContent } from "@/features/discover/visual-reference/discover-vr-sections";
import { VideosListSkeleton } from "@/features/discover/visual-reference/videos-list-skeleton";

export function VideosPageClient() {
  // TikTok Stage 2: "videos" tab — explorationGamma 0.48, format bias video 1.14×
  const { viewModel, feedLoading, feedError, refetchFeed } = useDiscoverViewModel("videos");

  return (
    <DiscoverVerticalPageShell
      title="Videolar"
      description="Uzun form analiz ve eğitim içerikleri — YouTube tarzı piyasa derinliği."
      viewModel={viewModel}
      feedLoading={feedLoading}
      feedError={feedError}
      onFeedRetry={refetchFeed}
      pageTone="videos"
    >
      {feedLoading ? <VideosListSkeleton inline /> : <VideosFullPageContent vm={viewModel} />}
    </DiscoverVerticalPageShell>
  );
}
