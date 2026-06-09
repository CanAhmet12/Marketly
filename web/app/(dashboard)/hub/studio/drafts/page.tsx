import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioDraftsClient } from "@/features/studio/studio-drafts-client";

export const metadata: Metadata = {
  title: "Taslaklar",
  description: "Kaydedilmiş taslak içerikler.",
};

export default function HubStudioDraftsPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioDraftsClient />
    </Suspense>
  );
}
