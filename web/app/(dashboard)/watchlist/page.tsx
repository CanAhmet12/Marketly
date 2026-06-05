import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { WatchlistPageClient } from "@/features/markets/watchlist-page-client";
import { WatchlistPageSkeleton } from "@/features/markets/components/markets-states";

export default function WatchlistRoutePage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <WatchlistPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <WatchlistPageClient />
    </Suspense>
  );
}
