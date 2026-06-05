import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioLiveClient } from "@/features/studio/studio-live-client";

export const metadata: Metadata = {
  title: "Canlı",
  description: "Canlı yayın planlama ve geçmiş oturumlar.",
};

export default function StudioLivePage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioLiveClient />
    </Suspense>
  );
}
