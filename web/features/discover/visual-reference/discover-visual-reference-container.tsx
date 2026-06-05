"use client";

import { useMemo } from "react";

import { useDiscoverViewModel } from "@/features/discover/hooks/use-discover-view-model";
import { DiscoverVisualReferenceSurface } from "@/features/discover/visual-reference/discover-visual-reference-surface";

export function DiscoverVisualReferenceContainer() {
  const {
    viewModel,
    feedLoading,
    feedError,
    feedEnabled,
    refetchFeed,
    feedHasNextPage,
    feedIsFetchingNextPage,
    loadMoreFeed,
  } = useDiscoverViewModel();

  const stableVm = useMemo(() => viewModel, [viewModel]);

  return (
    <DiscoverVisualReferenceSurface
      viewModel={stableVm}
      feedLoading={feedLoading}
      feedError={feedError}
      feedEnabled={feedEnabled}
      onFeedRetry={refetchFeed}
      feedHasNextPage={feedHasNextPage}
      feedIsFetchingNextPage={feedIsFetchingNextPage}
      onFeedLoadMore={loadMoreFeed}
    />
  );
}
