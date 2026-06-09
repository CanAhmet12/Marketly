import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { SavedPageClient } from "@/features/social/saved-page-client";
import { SavedPageSkeleton } from "@/features/social/components/social-states";

export default function HubSavedPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <SavedPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <SavedPageClient />
    </Suspense>
  );
}
